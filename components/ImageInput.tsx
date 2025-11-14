import * as ImagePicker from 'expo-image-picker';
import { useEffect } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { Feather } from '@expo/vector-icons';
import Avatar from './Avatar';

interface ImageInputProps {
  name?: string;
  imageUri: string | null;
  onChangeImage: (file: ImagePicker.ImagePickerAsset | null) => void;
}

function ImageInput({ name, imageUri, onChangeImage }: ImageInputProps) {
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const [libraryPermission, cameraPermission] = await Promise.all([
        ImagePicker.requestMediaLibraryPermissionsAsync(),
        ImagePicker.requestCameraPermissionsAsync(),
      ]);

      if (!libraryPermission.granted) {
        alert('You need to enable permission to access the photo library');
      }
      if (!cameraPermission.granted) {
        alert('You need to enable permission to access the camera');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const handlePress = () => {
    if (!imageUri) {
      showImageOptions();
    } else {
      Alert.alert('Change Photo', 'What would you like to do?', [
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Choose from Library',
          onPress: selectImage,
        },
        {
          text: 'Remove Photo',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Delete', 'Are you sure you want to delete this photo?', [
              {
                text: 'Yes',
                style: 'destructive',
                onPress: () => onChangeImage(null),
              },
              { text: 'No', style: 'cancel' },
            ]);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Select Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: takePhoto,
      },
      {
        text: 'Choose from Library',
        onPress: selectImage,
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets[0]) {
        onChangeImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('Failed to take photo. Please try again.');
    }
  };

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets[0]) {
        onChangeImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      alert('Failed to select image. Please try again.');
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={styles.container}
    >
      <Avatar
        imageUrl={imageUri || undefined}
        size={100}
        fontSize={40}
        name={name || 'User'}
        placeholderType={name ? 'text' : 'icon'}
      />
      <Pressable style={styles.editButton}>
        <Feather
          name={imageUri ? "edit-2" : "camera"}
          size={24}
          color="white"
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563eb',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ImageInput;
