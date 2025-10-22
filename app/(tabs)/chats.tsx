import { useAuth } from "@/contexts/AuthContext";
import { chatService, userService } from "@/services/firebaseService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function ChatsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    const setupRealTimeChats = async () => {
      if (!user?.uid) return;

      try {
        // Set up real-time listener for chat updates
        unsubscribe = chatService.listenToChatUpdates(
          user.uid,
          async (data) => {
            if (cancelled) return;

            console.log("Real-time chat updates received:", data.length);

            // Load other user info for each chat
            const chatsWithUserInfo = await Promise.all(
              data.map(async (chat) => {
                if (chat.participants && chat.participants.length === 2) {
                  const otherUserId = chat.participants.find(
                    (uid: string) => uid !== user.uid
                  );
                  if (otherUserId) {
                    try {
                      const otherUserData = await userService.getUserById(
                        otherUserId
                      );
                      return { ...chat, otherUser: otherUserData };
                    } catch (e) {
                      console.log("Failed to load other user:", e);
                      return chat;
                    }
                  }
                }
                return chat;
              })
            );

            if (!cancelled) setChats(chatsWithUserInfo);
          }
        );
      } catch (e) {
        console.log("Setup real-time chats error:", e);
        if (!cancelled) setChats([]);
      }
    };

    setupRealTimeChats();

    return () => {
      cancelled = true;
      if (unsubscribe) {
        console.log("Cleaning up chat updates listener");
        unsubscribe();
      }
    };
  }, [user?.uid]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (search.trim().length === 0) {
        if (active) setSearchResults([]);
        return;
      }
      try {
        // email search from Firestore
        const results = await userService.searchUsersByEmail(search, {
          limit: 20,
        } as any);
        // Filter out current user from search results
        const filteredResults = results.filter(
          (result: any) => result.id !== user?.uid
        );
        if (active) setSearchResults(filteredResults);
      } catch (e) {
        console.log("search error", e);
        if (active) setSearchResults([]);
      }
    };

    // debounce simple
    const t = setTimeout(run, 300);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [search]);

  const renderChatItem = ({ item }: { item: any }) => {
    // For 1:1 chats, show other user's name instead of chatName
    let displayName = "Chat";

    if (item.chatName && item.chatName !== "Group Chat") {
      displayName = item.chatName;
    } else {
      // For 1:1 chats, try to get other user's name
      if (item.participants && item.participants.length === 2 && user?.uid) {
        const otherUserId = item.participants.find(
          (uid: string) => uid !== user.uid
        );
        if (otherUserId) {
          // Use otherUser name if available, otherwise show email or fallback
          displayName =
            item.otherUser?.fullName ||
            item.otherUser?.name ||
            item.otherUser?.email ||
            `User ${otherUserId.slice(0, 8)}`;
        }
      } else if (item.participants && item.participants.length > 2) {
        displayName = item.chatName || "Group Chat";
      }
    }

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <View style={styles.avatarContainer}>
          {item.otherUser?.avatar ? (
            <Image
              source={{
                uri: `data:${
                  item.otherUser.avatarType || "image/jpeg"
                };base64,${item.otherUser.avatar}`,
              }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <Text style={styles.avatarText}>
                {(item.otherUser?.fullName || item.otherUser?.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
          )}
          {item.otherUser?.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{displayName}</Text>
            <Text style={styles.chatTime}>
              {item.lastMessageTime
                ? new Date(item.lastMessageTime.toDate()).toLocaleTimeString(
                    "vi-VN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }
                  )
                : ""}
            </Text>
          </View>
          <View style={styles.chatFooter}>
            {item.lastMessage && (
              <Text style={styles.chatMessage} numberOfLines={1}>
                {item.lastMessageSenderId === user?.uid
                  ? `Bạn: ${item.lastMessage}`
                  : item.lastMessage}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => {
        setSearch("");
        setSearchResults([]);
        router.push(`/user-profile/${item.id}`);
      }}
    >
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image
            source={{
              uri: `data:${item.avatarType || "image/jpeg"};base64,${
                item.avatar
              }`,
            }}
            style={styles.avatar}
          />
        ) : (
          <View
            style={[
              styles.avatar,
              { alignItems: "center", justifyContent: "center" },
            ]}
          >
            <Text style={{ color: "#9E9E9E", fontWeight: "600" }}>
              {(item.fullName || item.email || "").slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.fullName || item.email}</Text>
          <Text style={styles.chatTime}></Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={styles.chatMessage} numberOfLines={1}>
            {item.email}
          </Text>
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
      {/* Header with integrated search */}
      <View style={styles.header}>
        <ExpoImage
          source={require("@/assets/logo/logo_full.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color="#9E9E9E" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm..."
              placeholderTextColor="#9E9E9E"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch("")}
                style={styles.clearButton}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color="#9E9E9E"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Search results or user chats */}
      {search.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderSearchItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      ) : chats.length === 0 ? (
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
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 12,
  },
  logo: {
    width: 100,
    height: 32,
  },
  searchContainer: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000000",
    paddingVertical: 0,
  },
  clearButton: {
    padding: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6D5FFD",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 2,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 28,
    backgroundColor: "#F0F0F0",
  },
  defaultAvatar: {
    backgroundColor: "#6D5FFD",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
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
