import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Text,
  StatusBar,
  Image,
  Dimensions,
} from "react-native";
import { useState, useRef } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface VideoPlayerProps {
  visible: boolean;
  videoUri: string;
  thumbnailUri: string;
  userName: string;
  timestamp: string;
  onClose: () => void;
}

export default function VideoPlayer({
  visible,
  videoUri,
  thumbnailUri,
  userName,
  timestamp,
  onClose,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(24); // Mock duration
  const [showControls, setShowControls] = useState(true);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar hidden />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=1" }}
              style={styles.headerAvatar}
            />
            <View style={styles.headerText}>
              <Text style={styles.headerName}>{userName}</Text>
              <Text style={styles.headerTime}>{timestamp}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Video Container */}
        <TouchableOpacity
          style={styles.videoContainer}
          activeOpacity={1}
          onPress={() => setShowControls(!showControls)}
        >
          <Image
            source={{ uri: thumbnailUri }}
            style={styles.video}
            resizeMode="contain"
          />

          {/* Play/Pause Overlay */}
          {showControls && (
            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={togglePlayPause}
            >
              <MaterialCommunityIcons
                name={isPlaying ? "pause" : "play"}
                size={64}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Controls */}
        {showControls && (
          <View style={styles.controls}>
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration}
                value={currentTime}
                onValueChange={setCurrentTime}
                minimumTrackTintColor="#6D5FFD"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbTintColor="#6D5FFD"
              />
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#333333",
  },
  headerText: {
    marginLeft: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerTime: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  videoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
  },
  playPauseButton: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  slider: {
    flex: 1,
    marginHorizontal: 12,
  },
});
