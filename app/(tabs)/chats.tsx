import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import ProfileMenu from "@/components/ProfileMenu";
import { useAuth } from "@/contexts/AuthContext";

// Sample data - giống như ảnh mẫu
const CHAT_DATA = [
  {
    id: "1",
    name: "George Alan",
    message: "Lorem ipsum dolor sit amet consectetur.",
    time: "4:30 PM",
    avatar: "https://i.pravatar.cc/150?img=1",
    online: true,
    unread: 0,
  },
  {
    id: "2",
    name: "Uber Cars",
    message: "Sender: Lorem ipsum dolor sit amet cons...",
    time: "4:30 PM",
    avatar: "https://i.pravatar.cc/150?img=2",
    online: false,
    unread: 0,
  },
  {
    id: "3",
    name: "Safiya Fareena",
    message: "📹 Video",
    time: "4:30 PM",
    avatar: "https://i.pravatar.cc/150?img=3",
    online: true,
    unread: 1,
  },
  {
    id: "4",
    name: "Robert Allen",
    message: "✓ 📷 Photo Lorem ipsum dolor sit amet...",
    time: "4:30 PM",
    avatar: "https://i.pravatar.cc/150?img=4",
    online: true,
    unread: 0,
  },
  {
    id: "5",
    name: "Epic Game",
    message: "John Paul: @Robert Lorem ipsum d...",
    time: "4:30 PM",
    avatar: "https://i.pravatar.cc/150?img=5",
    online: false,
    unread: 24,
  },
  {
    id: "6",
    name: "Scott Franklin",
    message: "🎤 Audio",
    time: "4:30 PM",
    avatar: "https://i.pravatar.cc/150?img=6",
    online: false,
    unread: 0,
  },
  {
    id: "7",
    name: "Muhammed",
    message: "✓ 😊 Emoji",
    time: "4:30 PM",
    avatar: "https://i.pravatar.cc/150?img=7",
    online: true,
    unread: 0,
  },
  {
    id: "8",
    name: "Innovative Online Shopping",
    message: "↪ Thread Lorem ipsum door sit amet co...",
    time: "4:30 PM",
    avatar: "https://i.pravatar.cc/150?img=8",
    online: true,
    unread: 0,
  },
  {
    id: "9",
    name: "Micheal Scott",
    message: "📞 Voice call",
    time: "4:30 PM",
    avatar: "https://i.pravatar.cc/150?img=9",
    online: false,
    unread: 0,
  },
];

export default function ChatsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [chats, setChats] = useState(CHAT_DATA);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const renderChatItem = ({ item }: { item: (typeof CHAT_DATA)[0] }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.online && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={styles.chatMessage} numberOfLines={1}>
            {item.message}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.skeletonContainer}>
        <View style={styles.skeletonItem}>
          <View style={styles.skeletonAvatar}>
            <Text style={styles.skeletonText}>SF</Text>
          </View>
          <View style={styles.skeletonLine} />
        </View>
        <View style={styles.skeletonItem}>
          <View style={[styles.skeletonAvatar, styles.skeletonAvatar2]}>
            <Text style={styles.skeletonText}>VN</Text>
          </View>
          <View style={styles.skeletonLine} />
        </View>
        <View style={styles.skeletonItem}>
          <View style={[styles.skeletonAvatar, styles.skeletonAvatar3]}>
            <Text style={styles.skeletonText}>MS</Text>
          </View>
          <View style={styles.skeletonLine} />
        </View>
      </View>
      <Text style={styles.emptyTitle}>No Conversations Yet</Text>
      <Text style={styles.emptyMessage}>
        Start a new chat or invite others to join the conversation.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <ExpoImage
          source={require("@/assets/logo/logo_full.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => setShowProfileMenu(true)}
          >
            <Text style={styles.profileText}>
              {user?.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "U"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat List */}
      {chats.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/new-group")}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="account-group"
          size={28}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {/* Profile Menu */}
      <ProfileMenu
        visible={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  logo: {
    width: 120,
    height: 40,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6D5FFD",
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 16,
  },
  chatItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0F0F0",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  chatTime: {
    fontSize: 12,
    color: "#9E9E9E",
  },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatMessage: {
    flex: 1,
    fontSize: 14,
    color: "#757575",
  },
  unreadBadge: {
    backgroundColor: "#6D5FFD",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  skeletonContainer: {
    width: "100%",
    marginBottom: 32,
  },
  skeletonItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  skeletonAvatar2: {
    backgroundColor: "#D0D0D0",
  },
  skeletonAvatar3: {
    backgroundColor: "#C0C0C0",
  },
  skeletonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  skeletonLine: {
    flex: 1,
    height: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6D5FFD",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
