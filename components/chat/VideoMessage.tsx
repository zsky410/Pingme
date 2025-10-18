import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAX_WIDTH = SCREEN_WIDTH * 0.7;

interface VideoMessageProps {
  thumbnailUri: string;
  isMine: boolean;
  onPress?: () => void;
}

export default function VideoMessage({
  thumbnailUri,
  isMine,
  onPress,
}: VideoMessageProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isMine ? styles.containerMine : styles.containerTheirs,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: thumbnailUri }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.playButton}>
        <MaterialCommunityIcons name="play" size={40} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    maxWidth: MAX_WIDTH,
    position: "relative",
  },
  containerMine: {
    borderWidth: 3,
    borderColor: "#6D5FFD",
  },
  containerTheirs: {
    borderWidth: 0,
  },
  thumbnail: {
    width: MAX_WIDTH - 6,
    height: 250,
    backgroundColor: "#F0F0F0",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
});
