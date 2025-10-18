import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

interface ReactionUser {
  id: string;
  name: string;
  avatar: string;
  emoji: string;
}

interface MessageReactionsProps {
  reactions: { emoji: string; count: number; users: ReactionUser[] }[];
  isMine: boolean;
  onPress?: () => void;
  onEmojiPress?: (emoji: string) => void;
}

export default function MessageReactions({
  reactions,
  isMine,
  onPress,
  onEmojiPress,
}: MessageReactionsProps) {
  if (!reactions || reactions.length === 0) return null;

  const checkIfUserReacted = (users: ReactionUser[]) => {
    return users.some((u) => u.id === "me");
  };

  return (
    <View
      style={[
        styles.container,
        isMine ? styles.containerMine : styles.containerTheirs,
      ]}
    >
      {reactions.map((reaction, index) => {
        const userReacted = checkIfUserReacted(reaction.users);
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.reactionBubble,
              userReacted && styles.reactionBubbleActive,
            ]}
            onPress={() => onEmojiPress?.(reaction.emoji)}
            onLongPress={onPress}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{reaction.emoji}</Text>
            {reaction.count > 0 && (
              <Text style={[styles.count, userReacted && styles.countActive]}>
                {reaction.count}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginTop: 4,
    gap: 4,
  },
  containerMine: {
    justifyContent: "flex-end",
  },
  containerTheirs: {
    justifyContent: "flex-start",
  },
  reactionBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  reactionBubbleActive: {
    backgroundColor: "#E8E3FF",
    borderColor: "#6D5FFD",
  },
  emoji: {
    fontSize: 14,
  },
  count: {
    fontSize: 12,
    fontWeight: "600",
    color: "#757575",
  },
  countActive: {
    color: "#6D5FFD",
  },
});
