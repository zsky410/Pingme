import { useClerk, useUser } from '@clerk/clerk-expo';
import clsx from 'clsx';
import { ImagePickerAsset } from 'expo-image-picker';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useChatContext } from 'stream-chat-expo';
import Button from '../../../components/Button';
import ImageInput from '../../../components/ImageInput';
import Screen from '../../../components/Screen';
import TextField from '../../../components/TextField';
import { getError } from '../../../lib/utils';

const ProfileScreen = () => {
  const { user } = useUser();
  const { client } = useChatContext();
  const clerk = useClerk();
  const defaultImage: ImagePickerAsset = {
    uri: user?.hasImage ? user?.imageUrl : '',
    width: 100,
    height: 100,
  };

  const usernameParts = user?.username?.split('_')!;
  const [username, setUsername] = useState(usernameParts[0]);
  const [usernameNumber, setUsernameNumber] = useState(usernameParts[1]);
  const [firstName, setFirstName] = useState(user?.firstName!);
  const [lastName, setLastName] = useState(user?.lastName!);
  const [profileImage, setProfileImage] =
    useState<ImagePickerAsset>(defaultImage);
  const [numberError, setNumberError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateProfile = async () => {
    try {
      setLoading(true);
      const finalUsername = `${username}_${usernameNumber}`;
      const result = await user?.update({
        firstName,
        lastName,
        username: finalUsername,
      });

      let imageResult:
        | { id?: string; name: string | null; publicUrl: string | null }
        | undefined;

      // get base64 from uri
      const response = await fetch(profileImage.uri);
      const blob = await response.blob();
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        imageResult = await clerk.user?.setProfileImage({
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

  const onChangeNumber = (number: string) => {
    if (number === '00') return;
    setUsernameNumber(number);

    const isNumber = /^\d+$/.test(number);
    const isValid = isNumber && number.length === 2 && number !== '00';

    if (!isValid) {
      setNumberError('Invalid username, enter a minimum of 2 digits');
    } else {
      setNumberError('');
    }
  };

  return (
    <Screen
      viewClassName="pt-1 px-4 items-center gap-6"
      loadingOverlay={loading}
    >
      <ImageInput
        name={user?.fullName!}
        imageUri={profileImage.uri}
        onChangeImage={(asset) =>
          setProfileImage(asset ?? { ...defaultImage, uri: '' })
        }
      />
      <View className="gap-3">
        <TextField
          value={firstName}
          placeholder="First name"
          onChangeText={(name) => setFirstName(name)}
        />
        <TextField
          value={lastName}
          placeholder="Last name"
          onChangeText={(name) => setLastName(name)}
        />
        <View className="relative">
          <TextField
            autoCapitalize="none"
            value={username}
            placeholder="Username"
            onChangeText={(name) => setUsername(name)}
            className="pr-12"
          />
          <View className="absolute right-3 top-3 flex-row gap-2">
            <View className="w-0.5 h-5 bg-gray-300" />
            <TextInput
              keyboardType="number-pad"
              maxLength={2}
              value={usernameNumber}
              onChangeText={onChangeNumber}
              className="w-5 h-5"
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
      <Button
        onPress={updateProfile}
        disabled={
          loading || !username || !usernameNumber || !firstName || !lastName
        }
      >
        Save
      </Button>
    </Screen>
  );
};

export default ProfileScreen;
