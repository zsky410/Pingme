import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const EMOJI_REACTIONS = ["😍", "👍", "🔥", "😊", "❤️", "😂", "+"];

export interface MessageOption {
  id: string;
  label: string;
  icon: string;
  color?: string;
  action: () => void;
}

interface MessageOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  options: MessageOption[];
  onReaction?: (emoji: string) => void;
  onOpenEmojiPicker?: () => void;
  isMine?: boolean;
}

export default function MessageOptionsSheet({
  visible,
  onClose,
  options,
  onReaction,
  onOpenEmojiPicker,
  isMine = false,
}: MessageOptionsSheetProps) {
  const handleReaction = (emoji: string) => {
    if (emoji === "+") {
      // Open full emoji picker
      onOpenEmojiPicker?.();
      onClose();
    } else {
      onReaction?.(emoji);
      onClose();
    }
  };

  const handleOptionPress = (option: MessageOption) => {
    option.action();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.bottomSheet}>
          {/* Emoji Reactions - Only show for other people's messages */}
          {onReaction && !isMine && (
            <View style={styles.reactionsContainer}>
              {EMOJI_REACTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiButton,
                    emoji === "+" && styles.emojiButtonPlus,
                  ]}
                  onPress={() => handleReaction(emoji)}
                >
                  {emoji === "+" ? (
                    <MaterialCommunityIcons
                      name="plus-circle"
                      size={32}
                      color="#6D5FFD"
                    />
                  ) : (
                    <Text style={styles.emoji}>{emoji}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Options */}
          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionItem,
                  index === options.length - 1 && styles.optionItemLast,
                ]}
                onPress={() => handleOptionPress(option)}
              >
                <MaterialCommunityIcons
                  name={option.icon as any}
                  size={20}
                  color={option.color || "#000000"}
                  style={styles.optionIcon}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    option.color && { color: option.color },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  reactionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  emojiButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "transparent",
  },
  emoji: {
    fontSize: 28,
    color: "#000000",
  },
  emojiButtonPlus: {
    backgroundColor: "#F0EDFF",
  },
  optionsContainer: {
    paddingTop: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
  },
  optionItemLast: {
    borderBottomWidth: 0,
  },
  optionIcon: {
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 16,
    color: "#000000",
  },
});
