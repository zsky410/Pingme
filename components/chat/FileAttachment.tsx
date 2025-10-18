import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface FileAttachmentProps {
  fileName: string;
  fileSize: string;
  fileDate: string;
  isMine: boolean;
  onPress?: () => void;
}

export default function FileAttachment({
  fileName,
  fileSize,
  fileDate,
  isMine,
  onPress,
}: FileAttachmentProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isMine ? styles.containerMine : styles.containerTheirs,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View
          style={[styles.iconContainer, isMine && styles.iconContainerMine]}
        >
          <MaterialCommunityIcons
            name="file-pdf-box"
            size={32}
            color="#FF5252"
          />
        </View>
        <View style={styles.fileInfo}>
          <Text
            style={[styles.fileName, isMine && styles.fileNameMine]}
            numberOfLines={1}
          >
            {fileName}
          </Text>
          <Text style={[styles.fileDetails, isMine && styles.fileDetailsMine]}>
            {fileDate} • {fileSize} • PDF
          </Text>
        </View>
        {!isMine && (
          <TouchableOpacity style={styles.downloadButton}>
            <MaterialCommunityIcons name="download" size={24} color="#6D5FFD" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    maxWidth: "85%",
  },
  containerMine: {
    backgroundColor: "#6D5FFD",
  },
  containerTheirs: {
    backgroundColor: "#F5F5F5",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconContainerMine: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  fileNameMine: {
    color: "#FFFFFF",
  },
  fileDetails: {
    fontSize: 12,
    color: "#757575",
  },
  fileDetailsMine: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  downloadButton: {
    padding: 4,
    marginLeft: 8,
  },
});
