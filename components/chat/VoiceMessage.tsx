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
          const audioSource =
            voiceUri && voiceUri !== "mock-voice-uri"
              ? { uri: voiceUri }
              : // Demo audio - a short notification sound
                {
                  uri: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
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
        styles.messageBubble,
        isMine ? styles.myBubble : styles.theirBubble,
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
          size={20}
          color={isMine ? "#FFFFFF" : "#6D5FFD"}
        />
      </TouchableOpacity>

      {/* Waveform & Time Container */}
      <View style={styles.waveformTimeContainer}>
        {/* Waveform */}
        <View style={styles.waveformContainer}>
          {[...Array(25)].map((_, index) => {
            // Generate varied heights for waveform effect
            const heights = [
              4, 8, 6, 12, 8, 4, 10, 14, 8, 6, 12, 8, 10, 8, 6, 12, 8, 4, 8, 10,
              6, 10, 8, 12, 6,
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
                        : "rgba(0, 0, 0, 0.2)",
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
  messageBubble: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "85%",
    minWidth: 200,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
  },
  myBubble: {
    backgroundColor: "#6D5FFD",
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: "#F0F0F0",
    borderBottomLeftRadius: 4,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonMine: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  playButtonTheirs: {
    backgroundColor: "rgba(109, 95, 253, 0.1)",
  },
  waveformTimeContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 4,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 18,
    gap: 2.5,
    width: "100%",
  },
  waveBar: {
    width: 2,
    borderRadius: 1,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "left",
    alignSelf: "flex-start",
  },
  timeTextMine: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  timeTextTheirs: {
    color: "#757575",
  },
});
