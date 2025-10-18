import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import { useGroups } from "@/contexts/GroupsContext";

export default function GroupsScreen() {
  const router = useRouter();
  const { groups } = useGroups();

  const renderGroupItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.online && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.groupContent}>
        <View style={styles.groupHeader}>
          <View style={styles.groupNameRow}>
            <Text style={styles.groupName}>{item.name}</Text>
            {item.type !== "Public" && (
              <MaterialCommunityIcons
                name={item.type === "Private" ? "lock" : "key"}
                size={14}
                color="#757575"
                style={styles.typeIcon}
              />
            )}
          </View>
          <Text style={styles.groupTime}>{item.time}</Text>
        </View>
        <View style={styles.groupFooter}>
          <Text style={styles.groupMembers}>{item.members} Members</Text>
          <Text style={styles.groupMessage} numberOfLines={1}>
            {item.lastMessage}
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
      <MaterialCommunityIcons
        name="account-group-outline"
        size={80}
        color="#E0E0E0"
      />
      <Text style={styles.emptyTitle}>No Groups Yet</Text>
      <Text style={styles.emptyMessage}>
        Create a new group by tapping the + button
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
        <TouchableOpacity onPress={() => router.push("/new-group")}>
          <MaterialCommunityIcons
            name="plus-circle"
            size={28}
            color="#6D5FFD"
          />
        </TouchableOpacity>
      </View>

      {/* Groups List */}
      {groups.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={renderGroupItem}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  listContent: {
    paddingBottom: 16,
  },
  groupItem: {
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
  groupContent: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  groupNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  typeIcon: {
    marginTop: 2,
  },
  groupTime: {
    fontSize: 12,
    color: "#9E9E9E",
  },
  groupFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  groupMembers: {
    fontSize: 12,
    color: "#6D5FFD",
    fontWeight: "600",
  },
  groupMessage: {
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
    lineHeight: 20,
  },
});
