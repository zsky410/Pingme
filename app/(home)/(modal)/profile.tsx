import { useClerk, useUser } from '@clerk/clerk-expo';
import clsx from 'clsx';
import { ImagePickerAsset } from 'expo-image-picker';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
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

      const response = await fetch(profileImage.uri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const imageResult = await clerk.user?.setProfileImage({
          file: base64data,
        });
        await client.upsertUser({
          id: result?.id!,
          name: result?.fullName!,
          username: result?.username!,
          image: imageResult ? imageResult.publicUrl! : undefined,
        });
      };

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
      viewClassName="pt-3 android:pt-14 px-4 items-center gap-6"
      loadingOverlay={loading}
    >
      <View className="items-center gap-3">
        <ImageInput
          name={user?.fullName!}
          imageUri={profileImage.uri}
          onChangeImage={(asset) =>
            setProfileImage(asset ?? { ...defaultImage, uri: '' })
          }
        />
        <Text className="text-sm text-gray-400">
          {username ? `${username}_${usernameNumber}` : 'Choose your username'}
        </Text>
      </View>
      <View className="gap-3">
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
        <View className="relative">
          <TextField
            autoCapitalize="none"
            value={username}
            placeholder="Username"
            onChangeText={onChangeUsername}
            className="pr-12"
          />
          <View className="absolute right-3 top-3 flex-row gap-2">
            <View className="w-0.5 h-5 bg-gray-300" />
            <TextInput
              keyboardType="number-pad"
              maxLength={2}
              value={usernameNumber}
              onChangeText={onChangeNumber}
              className="w-5 h-5 android:w-8 android:h-12 android:bottom-3.5"
            />
          </View>
          <Text
            className={clsx(
              'pl-2 pt-2 text-xs',
              numberError ? 'text-red-500' : 'text-gray-500'
            )}
          >
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

export default ProfileScreen;
