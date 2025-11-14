import { useClerk, useUser } from '@clerk/clerk-expo';
import { ImagePickerAsset } from 'expo-image-picker';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useChatContext } from 'stream-chat-expo';

import Button from '@/components/Button';
import ImageInput from '@/components/ImageInput';
import Screen from '@/components/Screen';
import TextField from '@/components/TextField';
import useUserForm from '@/hooks/useUserForm';
import { getError } from '@/lib/utils';

const ProfileScreen = () => {
  const { user } = useUser();
  const { client } = useChatContext();
  const clerk = useClerk();
  const usernameParts = user?.username?.split('_')!;
  const initialFormValues = {
    firstName: user?.firstName!,
    lastName: user?.lastName!,
    username: usernameParts[0],
    usernameNumber: usernameParts[1],
  };
  const defaultImage: ImagePickerAsset = {
    uri: user?.hasImage ? user?.imageUrl : '',
    width: 100,
    height: 100,
  };

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

  const submitDisabled =
    loading || !username || !usernameNumber || !firstName || !lastName;

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

      const updateUserImage = async (data: string | null) => {
        try {
          const imageResult = await clerk.user?.setProfileImage({
            file: data,
          });
          await client.upsertUser({
            id: result?.id!,
            image: imageResult ? imageResult.publicUrl! : undefined,
          });
        } catch (error) {
          console.error('Error updating user image:', error);
        }
      };

      if (profileImage.uri) {
        const response = await fetch(profileImage.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          await updateUserImage(base64data);
        };
      } else {
        await updateUserImage(null);
      }

      alert('Profile updated successfully!');
    } catch (error) {
      getError(error);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      viewStyle={styles.view}
      loadingOverlay={loading}
    >
      <View style={styles.header}>
        <ImageInput
          name={user?.fullName!}
          imageUri={profileImage.uri}
          onChangeImage={(asset) =>
            setProfileImage(asset ?? { ...defaultImage, uri: '' })
          }
        />
        <Text style={styles.usernameText}>
          {username ? `${username}_${usernameNumber}` : 'Choose your username'}
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
                Platform.OS === 'android' && styles.numberInputAndroid,
              ]}
            />
          </View>
          <Text style={[styles.helperText, numberError && styles.errorText]}>
            {numberError ||
              'Usernames are always paired with a set of numbers.'}
          </Text>
        </View>
      </View>
      <Button onPress={updateProfile} disabled={submitDisabled}>
        Save
      </Button>
    </Screen>
  );
};

const styles = StyleSheet.create({
  view: {
    paddingTop: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  usernameText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  form: {
    gap: 12,
    width: '100%',
  },
  usernameContainer: {
    position: 'relative',
  },
  usernameInput: {
    paddingRight: 48,
  },
  usernameSuffix: {
    position: 'absolute',
    right: 12,
    top: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  divider: {
    width: 0.5,
    height: 20,
    backgroundColor: '#D1D5DB',
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
    color: '#6B7280',
  },
  errorText: {
    color: '#EF4444',
  },
});

export default ProfileScreen;
