import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAX_WIDTH = SCREEN_WIDTH * 0.7;
const MAX_HEIGHT = 400;

interface ImageMessageProps {
  uri: string;
  isMine: boolean;
  onPress?: () => void;
}

export default function ImageMessage({
  uri,
  isMine,
  onPress,
}: ImageMessageProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isMine ? styles.containerMine : styles.containerTheirs,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    maxWidth: MAX_WIDTH,
  },
  containerMine: {
    borderWidth: 3,
    borderColor: "#6D5FFD",
  },
  containerTheirs: {
    borderWidth: 0,
  },
  image: {
    width: MAX_WIDTH - 6,
    height: 250,
    backgroundColor: "#F0F0F0",
  },
});
