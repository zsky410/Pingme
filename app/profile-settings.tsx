import { auth } from "@/config/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/firebaseService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileSettingsScreen() {
  const { user, logout, reloadUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const handleImagePicker = async () => {
    try {
      // Request permission for both camera and library
      const [libraryPermission, cameraPermission] = await Promise.all([
        ImagePicker.requestMediaLibraryPermissionsAsync(),
        ImagePicker.requestCameraPermissionsAsync(),
      ]);

      if (
        libraryPermission.granted === false &&
        cameraPermission.granted === false
      ) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera and photo library is required!"
        );
        return;
      }

      // Show action sheet to choose between camera and library
      Alert.alert("Select Image", "Choose an option", [
        {
          text: "Camera",
          onPress: () => launchCamera(),
        },
        {
          text: "Photo Library",
          onPress: () => launchLibrary(),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    } catch (error) {
      console.error("Error in image picker:", error);
      Alert.alert("Error", "Failed to open image picker");
    }
  };

  const launchLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2, // Very low quality for small file size
        base64: true, // Get base64 directly
      });
      await handleImageResult(result);
    } catch (error) {
      console.error("Error launching library:", error);
      Alert.alert("Error", "Failed to open photo library");
    }
  };

  const launchCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2, // Very low quality for small file size
        base64: true, // Get base64 directly
      });
      await handleImageResult(result);
    } catch (error) {
      console.error("Error launching camera:", error);
      Alert.alert("Error", "Failed to open camera");
    }
  };

  const handleImageResult = async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets[0]) {
      setLoading(true);
      const imageUri = result.assets[0].uri;
      const base64 = result.assets[0].base64;

      try {
        if (base64) {
          // Use base64 directly from ImagePicker (much smaller)
          console.log("Using base64 directly from ImagePicker");
          console.log("Base64 length:", base64.length);

          // Save base64 directly to Firestore
          await userService.updateUserProfile(user?.uid || "", {
            avatar: base64,
            avatarType: "image/jpeg",
            avatarUpdatedAt: new Date().toISOString(),
          });

          console.log("Avatar saved to Firestore successfully");
          Alert.alert("Success", "Avatar updated successfully!");

          // Reload user data to show updated avatar
          await reloadUser();
        } else {
          // Fallback to blob conversion if base64 not available
          console.log("Base64 not available, using blob conversion");
          const response = await fetch(imageUri);
          const blob = await response.blob();

          // Check if blob is valid
          if (blob.size === 0) {
            throw new Error("Invalid image file");
          }

          console.log("Image blob size:", blob.size, "bytes");
          console.log("Image blob type:", blob.type);

          // Upload avatar as base64 to Firestore
          const avatarBase64 = await userService.uploadAvatar(
            user?.uid || "",
            blob
          );

          Alert.alert("Success", "Avatar updated successfully!");

          // Reload user data to show updated avatar
          await reloadUser();
        }
      } catch (uploadError) {
        console.error("Upload error:", uploadError);
        Alert.alert(
          "Upload Error",
          `Failed to upload avatar: ${uploadError.message}`
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEmailUpdate = async () => {
    if (!email || email === user?.email) {
      Alert.alert("No Changes", "Email is the same as current email");
      return;
    }

    try {
      setLoading(true);
      await updateProfile(auth.currentUser!, {
        email: email,
      });
      Alert.alert("Success", "Email updated successfully!");
    } catch (error: any) {
      console.error("Error updating email:", error);
      Alert.alert("Error", error.message || "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user?.email || "",
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser!, credential);

      // Update password
      await updatePassword(auth.currentUser!, newPassword);

      Alert.alert("Success", "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordFields(false);
    } catch (error: any) {
      console.error("Error updating password:", error);
      Alert.alert("Error", error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avatar</Text>
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleImagePicker}
              disabled={loading}
            >
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <MaterialCommunityIcons
                  name="account-circle"
                  size={80}
                  color="#6D5FFD"
                />
              )}
              <View style={styles.editIcon}>
                <MaterialCommunityIcons
                  name="camera"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarText}>Tap to change avatar</Text>
          </View>
        </View>

        {/* Email Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color="#9E9E9E"
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleEmailUpdate}
            disabled={loading}
          >
            <Text style={styles.updateButtonText}>Update Email</Text>
          </TouchableOpacity>
        </View>

        {/* Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Password</Text>
          {!showPasswordFields ? (
            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={() => setShowPasswordFields(true)}
            >
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color="#6D5FFD"
              />
              <Text style={styles.changePasswordText}>Change Password</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.passwordFields}>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color="#9E9E9E"
                />
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Current password"
                  secureTextEntry
                />
              </View>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color="#9E9E9E"
                />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="New password"
                  secureTextEntry
                />
              </View>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color="#9E9E9E"
                />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry
                />
              </View>
              <View style={styles.passwordActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowPasswordFields(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={handlePasswordChange}
                  disabled={loading}
                >
                  <Text style={styles.updateButtonText}>Update Password</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={20} color="#F44336" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  avatarSection: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6D5FFD",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    color: "#9E9E9E",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  updateButton: {
    backgroundColor: "#6D5FFD",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F0FF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  changePasswordText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6D5FFD",
  },
  passwordFields: {
    gap: 12,
  },
  passwordActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#9E9E9E",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#F44336",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F44336",
  },
});
