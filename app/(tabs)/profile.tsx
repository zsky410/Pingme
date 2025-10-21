import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/firebaseService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
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

export default function ProfileTab() {
  const { user, logout, reloadUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState(user?.username || "");
  const [fullName, setFullName] = useState(user?.fullName || "");

  // Password visibility state (single toggle for all password fields)
  const [showPasswords, setShowPasswords] = useState(false);

  // Track if any field has been modified
  const hasChanges =
    username !== (user?.username || "") ||
    fullName !== (user?.fullName || "") ||
    currentPassword !== "" ||
    newPassword !== "" ||
    confirmPassword !== "";

  const handleImagePicker = () => {
    Alert.alert("Select Avatar", "Choose how you want to add your avatar", [
      { text: "Cancel", style: "cancel" },
      { text: "Camera", onPress: launchCamera },
      { text: "Photo Library", onPress: launchLibrary },
    ]);
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

  const handleBulkUpdate = async () => {
    if (!hasChanges) {
      Alert.alert("No Changes", "No changes to update");
      return;
    }

    // Validate password fields if any password field is filled
    if (currentPassword || newPassword || confirmPassword) {
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
    }

    setLoading(true);
    try {
      const updates: any = {};

      // Update username if changed
      if (username !== (user?.username || "")) {
        updates.username = username;
      }

      // Update full name if changed
      if (fullName !== (user?.fullName || "")) {
        updates.fullName = fullName;
      }

      // Update Firestore fields first
      if (Object.keys(updates).length > 0) {
        await userService.updateUserProfile(user?.uid || "", updates);
      }

      // Update password if provided (separate try-catch for better error handling)
      if (currentPassword && newPassword && confirmPassword) {
        try {
          const {
            updatePassword,
            reauthenticateWithCredential,
            EmailAuthProvider,
          } = await import("firebase/auth");
          const { auth } = await import("@/config/firebase");

          // Re-authenticate user
          const credential = EmailAuthProvider.credential(
            user?.email || "",
            currentPassword
          );
          await reauthenticateWithCredential(auth.currentUser!, credential);

          // Update password
          await updatePassword(auth.currentUser!, newPassword);

          // Clear password fields
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");

          Alert.alert("Success", "Password updated successfully!");
        } catch (passwordError: any) {
          console.error("Password update error:", passwordError);

          // Handle specific password errors
          let errorMessage = "Failed to update password";
          if (passwordError.code === "auth/invalid-credential") {
            errorMessage =
              "Current password is incorrect. Please check and try again.";
          } else if (passwordError.code === "auth/weak-password") {
            errorMessage =
              "New password is too weak. Please choose a stronger password.";
          } else if (passwordError.code === "auth/requires-recent-login") {
            errorMessage =
              "Please log out and log in again before changing password.";
          }

          Alert.alert("Password Update Error", errorMessage);
          return; // Don't show success message if password update failed
        }
      }

      // Show success message for profile updates (username, full name)
      if (Object.keys(updates).length > 0) {
        Alert.alert("Success", "Profile updated successfully!");
      }

      await reloadUser();
    } catch (error: any) {
      console.error("Profile update error:", error);
      Alert.alert("Error", `Failed to update profile: ${error.message}`);
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
        <Text style={styles.headerTitle}>Profile</Text>
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

        {/* Full Name Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            editable={!loading}
          />
        </View>

        {/* Username Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            editable={!loading}
          />
        </View>

        {/* Email Section - Read Only */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email</Text>
          <TextInput
            style={[styles.input, styles.readOnlyInput]}
            value={user?.email || ""}
            placeholder="Email"
            editable={false}
          />
          <Text style={styles.readOnlyText}>
            Email cannot be changed for security reasons
          </Text>
        </View>

        {/* Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <Text style={styles.passwordHint}>
            Leave password fields empty if you don't want to change password
          </Text>
          <View style={styles.passwordContainer}>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInputWithToggle}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                secureTextEntry={!showPasswords}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPasswords(!showPasswords)}
                disabled={loading}
              >
                <MaterialCommunityIcons
                  name={showPasswords ? "eye-off" : "eye"}
                  size={20}
                  color="#666666"
                />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.passwordInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password (min 6 characters)"
              secureTextEntry={!showPasswords}
              editable={!loading}
            />

            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry={!showPasswords}
              editable={!loading}
            />
          </View>
        </View>

        {/* Update Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.updateAllButton,
              !hasChanges && styles.updateAllButtonDisabled,
            ]}
            onPress={handleBulkUpdate}
            disabled={loading || !hasChanges}
          >
            <Text style={styles.updateAllButtonText}>
              {loading ? "Updating..." : "Update Profile"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={loading}
          >
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
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
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
    color: "#666666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  readOnlyInput: {
    backgroundColor: "#F5F5F5",
    color: "#666666",
  },
  readOnlyText: {
    fontSize: 12,
    color: "#999999",
    marginTop: 4,
    fontStyle: "italic",
  },
  passwordHint: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 8,
    fontStyle: "italic",
  },
  passwordContainer: {
    gap: 12,
  },
  passwordInputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  passwordInputWithToggle: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingRight: 45, // Space for toggle button
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  passwordToggle: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  updateAllButton: {
    backgroundColor: "#6D5FFD",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  updateAllButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  updateAllButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEBEE",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#F44336",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F44336",
  },
});
