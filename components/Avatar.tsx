import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextStyle, View } from 'react-native';
import AppImage from './AppImage';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: number;
  fontSize?: TextStyle['fontSize'];
  fontWeight?: TextStyle['fontWeight'];
  placeholderType?: 'text' | 'icon';
}

const Avatar = ({
  imageUrl,
  size = 40,
  name,
  fontSize = 20,
  fontWeight = '500',
  placeholderType = 'text',
}: AvatarProps) => {
  if (imageUrl) {
    return (
      <View
        style={[styles.imageContainer, { width: size, height: size }]}
      >
        <AppImage
          source={{ uri: imageUrl }}
          style={styles.image}
          alt="name"
          contentFit="cover"
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.placeholderContainer,
        {
          width: size,
          height: size,
          backgroundColor: '#d8e8f0',
        },
      ]}
    >
      {placeholderType === 'text' && (
        <Text
          style={[
            styles.placeholderText,
            {
              fontSize,
              fontWeight,
            },
          ]}
        >
          {name ? name[0] : ''}
        </Text>
      )}
      {placeholderType === 'icon' && (
        <Ionicons name="people-outline" size={fontSize} color="#086da0" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: 'relative',
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: 9999,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flexShrink: 0,
    borderRadius: 9999,
    aspectRatio: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  placeholderText: {
    lineHeight: 2,
    color: '#086da0',
    textTransform: 'uppercase',
  },
});

export default Avatar;
