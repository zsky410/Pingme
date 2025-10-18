import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGroups } from "@/contexts/GroupsContext";

type GroupType = "Public" | "Private" | "Password";

export default function NewGroupScreen() {
  const router = useRouter();
  const { addGroup } = useGroups();
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState<GroupType>("Public");
  const [password, setPassword] = useState("");

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    if (groupType === "Password" && !password.trim()) {
      Alert.alert("Error", "Please enter a password for the group");
      return;
    }

    // Create new group
    const newGroup = {
      id: `group-${Date.now()}`,
      name: groupName,
      type: groupType,
      password: groupType === "Password" ? password : null,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      members: 1,
      lastMessage: "Group created",
      time: new Date()
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase(),
      online: true,
      unread: 0,
    };

    // Add to context
    addGroup(newGroup);

    Alert.alert("Success", "Group created successfully!", [
      {
        text: "OK",
        onPress: () => {
          router.back();
          // Navigate to the new group chat
          setTimeout(() => {
            router.push(`/chat/${newGroup.id}`);
          }, 300);
        },
      },
    ]);
  };

  return (
    <Pressable style={styles.overlay} onPress={() => router.back()}>
      <Pressable
        style={styles.modalContainer}
        onPress={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Group</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <MaterialCommunityIcons name="close" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Type</Text>
          <View style={styles.typeRow}>
            {(["Public", "Private", "Password"] as GroupType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  groupType === type && styles.typeButtonActive,
                ]}
                onPress={() => {
                  setGroupType(type);
                  if (type !== "Password") {
                    setPassword("");
                  }
                }}
              >
                <Text
                  style={[
                    styles.typeText,
                    groupType === type && styles.typeTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Name Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter the group name"
            placeholderTextColor="#9E9E9E"
            value={groupName}
            onChangeText={setGroupName}
          />
        </View>

        {/* Password Input (conditional) */}
        {groupType === "Password" && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#9E9E9E"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        )}

        {/* Create Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateGroup}
        >
          <Text style={styles.createButtonText}>Create Group</Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "85%",
    maxWidth: 400,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  closeButton: {
    padding: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#F0EDFF",
  },
  typeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#757575",
  },
  typeTextActive: {
    color: "#6D5FFD",
  },
  input: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#000000",
  },
  createButton: {
    backgroundColor: "#6D5FFD",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
