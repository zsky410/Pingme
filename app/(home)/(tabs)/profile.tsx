import { useClerk, useUser } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { ImagePickerAsset } from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useChatContext } from "stream-chat-expo";

import Button from "@/components/Button";
import ImageInput from "@/components/ImageInput";
import Screen from "@/components/Screen";
import TextField from "@/components/TextField";
import useUserForm from "@/hooks/useUserForm";
import { getError } from "@/lib/utils";

const ProfileScreen = () => {
  const { user, isLoaded } = useUser();
  const { client } = useChatContext();
  const clerk = useClerk();
  const router = useRouter();
  const { signOut } = useClerk();

  // Prepare form values with safe defaults
  const usernameParts = user?.username?.split("_") || [];
  const initialFormValues = {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: usernameParts[0] || "",
    usernameNumber: usernameParts[1] || "",
  };
  const defaultImage: ImagePickerAsset = {
    uri: user?.hasImage ? user?.imageUrl || "" : "",
    width: 100,
    height: 100,
  };

  // All hooks must be called before any conditional returns
  const {
    firstName,
    lastName,
    username,
    usernameNumber,
    numberError,
    onChangeFirstName,
    onChangeLastName,
    onChangeUsername,
    onChangeNumber,
  } = useUserForm(initialFormValues);
  const [profileImage, setProfileImage] =
    useState<ImagePickerAsset>(defaultImage);
  const [loading, setLoading] = useState(false);

  // Redirect if user is not loaded or doesn't exist
  useEffect(() => {
    if (isLoaded && !user) {
      router.replace("/");
    }
  }, [isLoaded, user, router]);

  // Update profileImage when user changes
  useEffect(() => {
    if (user?.hasImage && user?.imageUrl) {
      setProfileImage({
        uri: user.imageUrl,
        width: 100,
        height: 100,
      });
    }
  }, [user?.imageUrl, user?.hasImage]);

  // Early return if user is not loaded or doesn't exist (after all hooks)
  if (!isLoaded || !user) {
    return null;
  }

  const submitDisabled =
    loading || !username || !usernameNumber || !firstName || !lastName;

  // Helper function to convert image URI to base64
  const convertImageToBase64 = async (
    uri: string,
    mimeType?: string
  ): Promise<string> => {
    try {
      // Read file as base64 using expo-file-system
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Determine MIME type from parameter, URI, or file extension
      let finalMimeType = mimeType || "image/jpeg"; // default
      if (!mimeType) {
        const uriLower = uri.toLowerCase();
        if (uriLower.includes(".png") || uriLower.includes("png")) {
          finalMimeType = "image/png";
        } else if (uriLower.includes(".gif") || uriLower.includes("gif")) {
          finalMimeType = "image/gif";
        } else if (uriLower.includes(".webp") || uriLower.includes("webp")) {
          finalMimeType = "image/webp";
        } else if (uriLower.includes(".jpg") || uriLower.includes(".jpeg")) {
          finalMimeType = "image/jpeg";
        }
      }

      // Return data URL format that Clerk expects
      return `data:${finalMimeType};base64,${base64}`;
    } catch (error) {
      console.error("Error converting image to base64:", error);
      throw new Error("Failed to convert image to base64");
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      const finalUsername = `${username}_${usernameNumber}`;
      const result = await user?.update({
        firstName,
        lastName,
        username: finalUsername,
      });
      await client.upsertUser({
        id: result?.id!,
        name: result?.fullName!,
        username: result?.username!,
      });

      // Update profile image if changed
      if (profileImage.uri && profileImage.uri !== defaultImage.uri) {
        try {
          // Convert image to base64 using expo-file-system
          // Use mimeType from ImagePickerAsset if available
          const base64data = await convertImageToBase64(
            profileImage.uri,
            profileImage.mimeType || undefined
          );

          // Upload to Clerk
          const imageResult = await clerk.user?.setProfileImage({
            file: base64data,
          });

          // Reload user from Clerk to get updated image URL
          await user?.reload();

          // Update Stream Chat with new image URL
          if (imageResult?.publicUrl) {
            await client.upsertUser({
              id: result?.id!,
              name: result?.fullName!,
              username: result?.username!,
              image: imageResult.publicUrl,
            });

            // Update current user in Stream Chat client to reflect changes immediately
            if (client.user) {
              client.user.image = imageResult.publicUrl;
            }

            // Refresh channels to update user avatars in channel list
            try {
              const channels = await client.queryChannels({
                type: "messaging",
                members: { $in: [result?.id!] },
              });

              // Watch all channels to trigger refresh in ChannelList
              // This ensures Stream Chat SDK updates channel state and ChannelList re-renders
              await Promise.all(
                channels.map(async (channel) => {
                  try {
                    // Update user data in channel state
                    const members = Object.values(channel.state.members || {});
                    members.forEach((member) => {
                      if (member.user_id === result?.id && member.user) {
                        member.user.image = imageResult.publicUrl || undefined;
                      }
                    });

                    // Watch channel to trigger state update and refresh ChannelList
                    await channel.watch();
                  } catch (error) {
                    console.error(
                      `Error watching channel ${channel.id}:`,
                      error
                    );
                  }
                })
              );
            } catch (error) {
              console.error("Error refreshing channels:", error);
            }
          }
        } catch (error) {
          console.error("Error updating user image:", error);
          alert("Failed to update profile image. Please try again.");
        }
      } else if (!profileImage.uri && defaultImage.uri) {
        // Remove profile image
        try {
          await clerk.user?.setProfileImage({ file: null });

          // Reload user from Clerk
          await user?.reload();

          // Update Stream Chat
          await client.upsertUser({
            id: result?.id!,
            name: result?.fullName!,
            username: result?.username!,
            image: undefined,
          });

          // Update current user in Stream Chat client
          if (client.user) {
            client.user.image = undefined;
          }

          // Refresh channels to update user avatars in channel list
          try {
            const channels = await client.queryChannels({
              type: "messaging",
              members: { $in: [result?.id!] },
            });

            // Watch all channels to trigger refresh in ChannelList
            await Promise.all(
              channels.map(async (channel) => {
                try {
                  // Update user data in channel state
                  const members = Object.values(channel.state.members || {});
                  members.forEach((member) => {
                    if (member.user_id === result?.id && member.user) {
                      member.user.image = undefined;
                    }
                  });

                  // Watch channel to trigger state update and refresh ChannelList
                  await channel.watch();
                } catch (error) {
                  console.error(`Error watching channel ${channel.id}:`, error);
                }
              })
            );
          } catch (error) {
            console.error("Error refreshing channels:", error);
          }
        } catch (error) {
          console.error("Error removing user image:", error);
        }
      }

      alert("Profile updated successfully!");
    } catch (error) {
      getError(error);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will be handled by the useEffect above
      // or by the auth layout redirect
    } catch (err) {
      getError(err);
    }
  };

  return (
    <Screen viewStyle={styles.view} loadingOverlay={loading}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ImageInput
            name={user?.fullName!}
            imageUri={profileImage.uri}
            onChangeImage={(asset) =>
              setProfileImage(asset ?? { ...defaultImage, uri: "" })
            }
          />
          <Text style={styles.usernameText}>
            {username
              ? `${username}_${usernameNumber}`
              : "Choose your username"}
          </Text>
        </View>
        <View style={styles.form}>
          <TextField
            value={firstName}
            placeholder="First name"
            onChangeText={onChangeFirstName}
          />
          <TextField
            value={lastName}
            placeholder="Last name"
            onChangeText={onChangeLastName}
          />
          <View style={styles.usernameContainer}>
            <TextField
              autoCapitalize="none"
              value={username}
              placeholder="Username"
              onChangeText={onChangeUsername}
              inputStyle={styles.usernameInput}
            />
            <View style={styles.usernameSuffix}>
              <View style={styles.divider} />
              <TextInput
                keyboardType="number-pad"
                maxLength={2}
                value={usernameNumber}
                onChangeText={onChangeNumber}
                style={[
                  styles.numberInput,
                  Platform.OS === "android" && styles.numberInputAndroid,
                ]}
              />
            </View>
            <Text style={[styles.helperText, numberError && styles.errorText]}>
              {numberError ||
                "Usernames are always paired with a set of numbers."}
            </Text>
          </View>
        </View>
        <Button onPress={updateProfile} disabled={submitDisabled}>
          Save
        </Button>
        <Button
          variant="text"
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <View style={styles.signOutContent}>
            <Feather name="log-out" size={20} color="#DC2626" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </View>
        </Button>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 32,
    alignItems: "center",
    gap: 24,
  },
  header: {
    alignItems: "center",
    gap: 12,
  },
  usernameText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  form: {
    gap: 12,
    width: "100%",
  },
  usernameContainer: {
    position: "relative",
  },
  usernameInput: {
    paddingRight: 48,
  },
  usernameSuffix: {
    position: "absolute",
    right: 12,
    top: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  divider: {
    width: 0.5,
    height: 20,
    backgroundColor: "#D1D5DB",
  },
  numberInput: {
    width: 20,
    height: 20,
  },
  numberInputAndroid: {
    width: 32,
    height: 48,
    marginBottom: 14,
  },
  helperText: {
    paddingLeft: 8,
    paddingTop: 8,
    fontSize: 12,
    color: "#6B7280",
  },
  errorText: {
    color: "#EF4444",
  },
  signOutButton: {
    marginTop: 16,
    width: "100%",
  },
  signOutContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  signOutText: {
    color: "#DC2626",
    fontSize: 16,
  },
});

export default ProfileScreen;
