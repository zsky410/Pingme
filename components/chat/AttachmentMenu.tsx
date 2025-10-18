import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AttachmentOption {
  id: string;
  label: string;
  icon: string;
  color: string;
  action: () => void;
}

interface AttachmentMenuProps {
  visible: boolean;
  onClose: () => void;
  onSelectGallery: () => void;
  onSelectCamera: () => void;
  onSelectDocument: () => void;
  onSelectLocation: () => void;
  onSelectContact: () => void;
  onSelectPoll: () => void;
  onSelectVoice: () => void;
}

export default function AttachmentMenu({
  visible,
  onClose,
  onSelectGallery,
  onSelectCamera,
  onSelectDocument,
  onSelectLocation,
  onSelectContact,
  onSelectPoll,
  onSelectVoice,
}: AttachmentMenuProps) {
  const options: AttachmentOption[] = [
    {
      id: "gallery",
      label: "Gallery",
      icon: "image-multiple",
      color: "#9C27B0",
      action: onSelectGallery,
    },
    {
      id: "camera",
      label: "Camera",
      icon: "camera",
      color: "#E91E63",
      action: onSelectCamera,
    },
    {
      id: "document",
      label: "Document",
      icon: "file-document",
      color: "#3F51B5",
      action: onSelectDocument,
    },
    {
      id: "location",
      label: "Location",
      icon: "map-marker",
      color: "#4CAF50",
      action: onSelectLocation,
    },
    {
      id: "contact",
      label: "Contact",
      icon: "account",
      color: "#FF9800",
      action: onSelectContact,
    },
    {
      id: "poll",
      label: "Poll",
      icon: "poll",
      color: "#00BCD4",
      action: onSelectPoll,
    },
    {
      id: "voice",
      label: "Voice",
      icon: "microphone",
      color: "#F44336",
      action: onSelectVoice,
    },
  ];

  const handleOptionPress = (option: AttachmentOption) => {
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Share</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#757575" />
            </TouchableOpacity>
          </View>

          {/* Options Grid */}
          <View style={styles.optionsGrid}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionItem}
                onPress={() => handleOptionPress(option)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.optionIconContainer,
                    { backgroundColor: option.color },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={28}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
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
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  closeButton: {
    padding: 4,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingTop: 24,
  },
  optionItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 24,
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 13,
    color: "#424242",
    fontWeight: "500",
    textAlign: "center",
  },
});
