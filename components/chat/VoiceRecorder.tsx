import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface VoiceRecorderProps {
  visible: boolean;
  onClose: () => void;
  onSendVoice: (duration: number) => void;
}

export default function VoiceRecorder({
  visible,
  onClose,
  onSendVoice,
}: VoiceRecorderProps) {
  const [duration, setDuration] = useState(0);
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(() => {
    setDuration(0);

    // Start timer
    intervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000) as unknown as NodeJS.Timeout;

    // Start wave animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [waveAnimation]);

  const stopRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    waveAnimation.stopAnimation();
  }, [waveAnimation]);

  useEffect(() => {
    if (visible) {
      // Start recording when modal opens
      startRecording();
    } else {
      // Clean up when modal closes
      stopRecording();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [visible, startRecording, stopRecording]);

  const handleCancel = () => {
    stopRecording();
    onClose();
  };

  const handleSend = () => {
    stopRecording();
    onSendVoice(duration);
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const waveScale = waveAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Pressable style={styles.recorderContainer}>
          {/* Recording Indicator */}
          <View style={styles.recordingSection}>
            <Animated.View
              style={[
                styles.waveCircle,
                {
                  transform: [{ scale: waveScale }],
                },
              ]}
            />
            <View style={styles.micIcon}>
              <MaterialCommunityIcons
                name="microphone"
                size={32}
                color="#FFFFFF"
              />
            </View>
          </View>

          {/* Duration */}
          <Text style={styles.duration}>{formatDuration(duration)}</Text>
          <Text style={styles.recordingText}>Recording...</Text>

          {/* Wave Visualization */}
          <View style={styles.waveContainer}>
            {[...Array(20)].map((_, index) => {
              const minHeight = 20 + Math.random() * 30;
              const maxHeight = 40 + Math.random() * 40;
              const scaleY = waveAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [minHeight / maxHeight, 1],
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.waveBar,
                    {
                      height: maxHeight,
                      transform: [{ scaleY }],
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <MaterialCommunityIcons name="close" size={24} color="#F44336" />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <MaterialCommunityIcons name="send" size={24} color="#FFFFFF" />
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  recorderContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "85%",
    maxWidth: 400,
  },
  recordingSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  waveCircle: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(244, 67, 54, 0.2)",
  },
  micIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F44336",
    alignItems: "center",
    justifyContent: "center",
  },
  duration: {
    fontSize: 36,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  recordingText: {
    fontSize: 16,
    color: "#F44336",
    fontWeight: "600",
    marginBottom: 24,
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 80,
    gap: 3,
    marginBottom: 32,
  },
  waveBar: {
    width: 4,
    backgroundColor: "#6D5FFD",
    borderRadius: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEBEE",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F44336",
  },
  sendButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6D5FFD",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  sendText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
