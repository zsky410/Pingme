import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";

interface VoiceMessageProps {
  duration: number; // Duration in seconds
  isMine: boolean;
  voiceUri?: string; // In real app, this would be the audio file URI
}

export default function VoiceMessage({
  duration,
  isMine,
  voiceUri,
}: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Initialize audio mode
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.error("Error setting up audio:", error);
      }
    };

    setupAudio();

    return () => {
      // Cleanup sound on unmount
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Toggle play/pause
  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        // Pause
        if (sound) {
          await sound.pauseAsync();
          setIsPlaying(false);
        }
      } else {
        // Play
        if (sound) {
          // Resume if already loaded
          await sound.playAsync();
          setIsPlaying(true);
        } else {
          // Load and play new sound
          // For demo purposes, using a sample audio URL
          // In production, use voiceUri from the message
          const audioSource = voiceUri
            ? { uri: voiceUri }
            : // Demo audio - a short notification sound
              {
                uri: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
              };

          const { sound: newSound } = await Audio.Sound.createAsync(
            audioSource,
            { shouldPlay: true },
            onPlaybackStatusUpdate
          );
          setSound(newSound);
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Unable to play voice message");
    }
  };

  // Playback status callback
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      if (status.positionMillis && status.durationMillis) {
        const progress = status.positionMillis / status.durationMillis;
        const currentSeconds = status.positionMillis / 1000;
        setCurrentTime(currentSeconds);
      }

      if (status.didJustFinish) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }
  };

  // Update progress bar animation
  useEffect(() => {
    const progress = currentTime / duration;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [currentTime, duration]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={[
        styles.container,
        isMine ? styles.containerMine : styles.containerTheirs,
      ]}
    >
      {/* Play/Pause Button */}
      <TouchableOpacity
        style={[
          styles.playButton,
          isMine ? styles.playButtonMine : styles.playButtonTheirs,
        ]}
        onPress={handlePlayPause}
      >
        <MaterialCommunityIcons
          name={isPlaying ? "pause" : "play"}
          size={24}
          color={isMine ? "#FFFFFF" : "#6D5FFD"}
        />
      </TouchableOpacity>

      {/* Waveform & Progress */}
      <View style={styles.contentContainer}>
        {/* Wave bars */}
        <View style={styles.waveformContainer}>
          {[...Array(25)].map((_, index) => {
            // Generate consistent heights for each bar
            const heights = [
              8, 16, 12, 20, 14, 10, 18, 22, 16, 12, 20, 14, 18, 16, 12, 20, 14,
              10, 16, 20, 12, 18, 14, 16, 10,
            ];
            const height = heights[index % heights.length];
            const progress = currentTime / duration;
            const isActive = progress * 25 > index;

            return (
              <View
                key={index}
                style={[
                  styles.waveBar,
                  {
                    height,
                    backgroundColor:
                      isActive && isPlaying
                        ? isMine
                          ? "#FFFFFF"
                          : "#6D5FFD"
                        : isMine
                        ? "rgba(255, 255, 255, 0.4)"
                        : "rgba(109, 95, 253, 0.3)",
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Time display */}
        <Text
          style={[
            styles.timeText,
            isMine ? styles.timeTextMine : styles.timeTextTheirs,
          ]}
        >
          {isPlaying ? formatTime(currentTime) : formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: "75%",
    gap: 12,
  },
  containerMine: {
    backgroundColor: "#6D5FFD",
  },
  containerTheirs: {
    backgroundColor: "#F0F0F0",
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonMine: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  playButtonTheirs: {
    backgroundColor: "rgba(109, 95, 253, 0.1)",
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 24,
    gap: 2,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  timeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  timeTextMine: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  timeTextTheirs: {
    color: "#757575",
  },
});
