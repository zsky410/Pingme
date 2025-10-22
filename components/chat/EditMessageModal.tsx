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
import { useState, useEffect, useRef } from "react";
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
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setEditedMessage(message);
  }, [message]);

  useEffect(() => {
    if (visible && textInputRef.current) {
      // Focus the input when modal becomes visible
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  const handleSave = () => {
    if (editedMessage.trim()) {
      onSave(editedMessage.trim());
    }
  };

  const handleCancel = () => {
    setEditedMessage(message); // Reset to original message
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Message</Text>
            <TouchableOpacity
              style={[
                styles.saveButton,
                !editedMessage.trim() && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!editedMessage.trim()}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  !editedMessage.trim() && styles.saveButtonTextDisabled,
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>

          {/* Edit Input */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={textInputRef}
              style={styles.input}
              value={editedMessage}
              onChangeText={setEditedMessage}
              multiline
              placeholder="Type your message..."
              placeholderTextColor="#BDBDBD"
              textAlignVertical="top"
              returnKeyType="default"
              selectionColor="#6D5FFD"
            />
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    minHeight: "50%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
    textAlign: "center",
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#6D5FFD",
    fontWeight: "500",
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#6D5FFD",
    fontWeight: "600",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonTextDisabled: {
    color: "#BDBDBD",
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  input: {
    fontSize: 16,
    color: "#000000",
    minHeight: 120,
    maxHeight: 300,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    textAlignVertical: "top",
  },
});
