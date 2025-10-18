import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";

export interface MentionUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface MentionSuggestionsProps {
  visible: boolean;
  onClose: () => void;
  users: MentionUser[];
  onSelectUser: (user: MentionUser) => void;
  searchQuery: string;
}

export default function MentionSuggestions({
  visible,
  onClose,
  users,
  onSelectUser,
  searchQuery,
}: MentionSuggestionsProps) {
  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUser = ({ item }: { item: MentionUser }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => onSelectUser(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  if (filteredUsers.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.bottomSheet}>
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            style={styles.list}
          />
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
    maxHeight: 400,
  },
  list: {
    maxHeight: 400,
  },
  listContent: {
    paddingVertical: 8,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F0F0",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: "#757575",
  },
});
