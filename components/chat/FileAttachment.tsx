import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ToastAndroid,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as IntentLauncher from "expo-intent-launcher";
import { Platform } from "react-native";

interface FileAttachmentProps {
  fileName: string;
  fileSize: string;
  fileDate: string;
  isMine: boolean;
  fileUri?: string;
  onPress?: () => void;
}

export default function FileAttachment({
  fileName,
  fileSize,
  fileDate,
  isMine,
  fileUri,
  onPress,
}: FileAttachmentProps) {
  // Get file icon based on extension
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return { name: "file-pdf-box", color: "#FF5252" };
      case "doc":
      case "docx":
        return { name: "file-word-box", color: "#2196F3" };
      case "xls":
      case "xlsx":
        return { name: "file-excel-box", color: "#4CAF50" };
      case "ppt":
      case "pptx":
        return { name: "file-powerpoint-box", color: "#FF9800" };
      case "txt":
        return { name: "file-document-outline", color: "#757575" };
      case "zip":
      case "rar":
        return { name: "file-zip-box", color: "#9C27B0" };
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return { name: "file-image-box", color: "#4CAF50" };
      default:
        return { name: "file-document-outline", color: "#757575" };
    }
  };

  const getMimeTypeFromExtension = (ext: string | undefined) => {
    switch ((ext || "").toLowerCase()) {
      case "pdf":
        return "application/pdf";
      case "doc":
        return "application/msword";
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case "xls":
        return "application/vnd.ms-excel";
      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case "ppt":
        return "application/vnd.ms-powerpoint";
      case "pptx":
        return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      case "txt":
        return "text/plain";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "zip":
        return "application/zip";
      case "rar":
        return "application/x-rar-compressed";
      default:
        return "application/octet-stream";
    }
  };

  const handleDownload = async () => {
    if (!fileUri || typeof fileUri !== "string") {
      Alert.alert("Error", "File not available for download");
      return;
    }

    try {
      const fileExtension = fileName.split(".").pop() || "bin";
      const mimeTypeFromExt = getMimeTypeFromExtension(fileExtension);

      if (Platform.OS === "android") {
        // Save to app's document directory first
        const downloadPath = FileSystem.documentDirectory + fileName;

        if (fileUri.startsWith("data:")) {
          // Handle base64 data
          const commaIndex = fileUri.indexOf(",");
          if (commaIndex === -1) throw new Error("Invalid data URI format");
          const base64Data = fileUri.substring(commaIndex + 1);
          await FileSystem.writeAsStringAsync(downloadPath, base64Data, {
            encoding: "base64",
          });
        } else {
          // Handle URL download
          const res = await FileSystem.downloadAsync(fileUri, downloadPath);
          if (res.status !== 200) throw new Error("Download failed");
        }

        // Show toast and open file with system file manager
        ToastAndroid.show(`Downloaded: ${fileName}`, ToastAndroid.LONG);

        // Open file with default app
        const contentUri = await FileSystem.getContentUriAsync(downloadPath);
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentUri,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
          type: mimeTypeFromExt,
        });

        return;
      }

      // iOS or other platforms: fallback to system share/save sheet
      if (fileUri.startsWith("data:")) {
        const commaIndex = fileUri.indexOf(",");
        if (commaIndex === -1) throw new Error("Invalid data URI format");
        const base64Data = fileUri.substring(commaIndex + 1);
        const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
        const savedPath =
          FileSystem.documentDirectory +
          `${fileNameWithoutExt}_${Date.now()}.${fileExtension}`;
        await FileSystem.writeAsStringAsync(savedPath, base64Data, {
          encoding: "base64",
        });
        await Sharing.shareAsync(savedPath);
      } else {
        const downloadPath =
          FileSystem.documentDirectory + `${Date.now()}_${fileName}`;
        const res = await FileSystem.downloadAsync(fileUri, downloadPath);
        if (res.status !== 200) throw new Error("Download failed");
        await Sharing.shareAsync(res.uri);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert("Error", "Unable to download file");
    }
  };

  const fileIcon = getFileIcon(fileName);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isMine ? styles.containerMine : styles.containerTheirs,
      ]}
      onPress={onPress || handleDownload}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View
          style={[styles.iconContainer, isMine && styles.iconContainerMine]}
        >
          <MaterialCommunityIcons
            name={fileIcon.name as any}
            size={32}
            color={fileIcon.color}
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
            {fileDate} • {fileSize}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    maxWidth: "85%",
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerMine: {
    backgroundColor: "#6D5FFD",
    alignSelf: "flex-end",
  },
  containerTheirs: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignSelf: "flex-start",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainerMine: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 6,
    lineHeight: 20,
  },
  fileNameMine: {
    color: "#FFFFFF",
  },
  fileDetails: {
    fontSize: 13,
    color: "#666666",
    lineHeight: 18,
  },
  fileDetailsMine: {
    color: "rgba(255, 255, 255, 0.85)",
  },
});
