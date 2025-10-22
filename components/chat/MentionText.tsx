import { Text, StyleSheet } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

interface MentionTextProps {
  text: string;
  style?: any;
  mentionStyle?: any;
}

export default function MentionText({
  text,
  style,
  mentionStyle,
}: MentionTextProps) {
  const router = useRouter();
  // Regex to match @username pattern
  const mentionRegex = /@(\w+)/g;

  // Split text into parts (mention and regular text)
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex, match.index),
      });
    }

    // Add mention
    parts.push({
      type: "mention",
      content: match[0], // Full match including @
      username: match[1], // Username without @
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.substring(lastIndex),
    });
  }

  const handleMentionPress = (username: string) => {
    router.push(`/user-profile/${username}`);
  };

  return (
    <Text style={style}>
      {parts.map((part, index) =>
        part.type === "mention" ? (
          <Text
            key={index}
            style={[styles.mention, mentionStyle]}
            onPress={() => handleMentionPress(part.username || "")}
          >
            {part.content}
          </Text>
        ) : (
          <Text key={index}>{part.content}</Text>
        )
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  mention: {
    color: "#FF9800",
    fontWeight: "600",
  },
});
