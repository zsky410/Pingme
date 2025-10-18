import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

interface EditMessageModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  onSave: (newMessage: string) => void;
}

export default function EditMessageModal({
  visible,
  message,
  onClose,
  onSave,
}: EditMessageModalProps) {
  const [editedMessage, setEditedMessage] = useState(message);

  useEffect(() => {
    setEditedMessage(message);
  }, [message]);

  const handleSave = () => {
    if (editedMessage.trim()) {
      onSave(editedMessage);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Message</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Original Message */}
          <View style={styles.originalMessageContainer}>
            <Text style={styles.originalMessageLabel}>Original:</Text>
            <Text style={styles.originalMessage}>{message}</Text>
          </View>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={editedMessage}
              onChangeText={setEditedMessage}
              multiline
              autoFocus
              placeholder="Edit your message..."
              placeholderTextColor="#BDBDBD"
            />
          </View>

          {/* Bottom Bar */}
          <View style={styles.bottomBar}>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialCommunityIcons name="plus" size={24} color="#9E9E9E" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialCommunityIcons
                  name="microphone"
                  size={24}
                  color="#9E9E9E"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialCommunityIcons
                  name="emoticon-happy-outline"
                  size={24}
                  color="#9E9E9E"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialCommunityIcons
                  name="file-image-outline"
                  size={24}
                  color="#9E9E9E"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialCommunityIcons
                  name="star-outline"
                  size={24}
                  color="#9E9E9E"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  closeButton: {
    padding: 4,
  },
  originalMessageContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F9F9F9",
  },
  originalMessageLabel: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 4,
  },
  originalMessage: {
    fontSize: 14,
    color: "#000000",
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  input: {
    fontSize: 16,
    color: "#000000",
    maxHeight: 200,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  actionButtons: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6D5FFD",
    alignItems: "center",
    justifyContent: "center",
  },
});
