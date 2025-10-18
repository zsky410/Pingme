import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useState } from "react";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface ReactionUser {
  id: string;
  name: string;
  avatar: string;
  emoji: string;
}

interface ReactionDetailsSheetProps {
  visible: boolean;
  onClose: () => void;
  reactions: ReactionUser[];
}

export default function ReactionDetailsSheet({
  visible,
  onClose,
  reactions,
}: ReactionDetailsSheetProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Group reactions by emoji
  const reactionGroups = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, ReactionUser[]>);

  // Get filtered reactions
  const filteredReactions =
    selectedFilter === "all" ? reactions : reactionGroups[selectedFilter] || [];

  const renderTab = (emoji: string, count: number, isAll: boolean = false) => {
    const isSelected = selectedFilter === emoji;
    return (
      <TouchableOpacity
        key={emoji}
        style={[styles.tab, isSelected && styles.tabSelected]}
        onPress={() => setSelectedFilter(emoji)}
      >
        {isAll ? (
          <Text
            style={[styles.tabLabel, isSelected && styles.tabLabelSelected]}
          >
            All
          </Text>
        ) : (
          <Text style={styles.tabEmoji}>{emoji}</Text>
        )}
        <Text style={[styles.tabCount, isSelected && styles.tabCountSelected]}>
          {count}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderReactionUser = ({
    item,
    index,
  }: {
    item: ReactionUser;
    index: number;
  }) => (
    <View style={styles.userItem}>
      <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userEmoji}>{item.emoji}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.bottomSheet}>
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {renderTab("all", reactions.length, true)}
            {Object.entries(reactionGroups).map(([emoji, users]) =>
              renderTab(emoji, users.length)
            )}
          </View>

          {/* Users List */}
          <FlatList
            data={filteredReactions}
            keyExtractor={(item, index) => `${item.id}-${item.emoji}-${index}`}
            renderItem={renderReactionUser}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
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
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    gap: 6,
  },
  tabSelected: {
    backgroundColor: "#6D5FFD",
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#757575",
  },
  tabLabelSelected: {
    color: "#FFFFFF",
  },
  tabEmoji: {
    fontSize: 16,
  },
  tabCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#757575",
  },
  tabCountSelected: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingVertical: 16,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 12,
  },
  userName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  userEmoji: {
    fontSize: 20,
  },
});
