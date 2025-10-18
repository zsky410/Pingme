import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { Poll } from "@/contexts/PollContext";

interface PollMessageProps {
  poll: Poll;
  isMine: boolean;
  onVote: (optionIndex: number) => void;
}

export default function PollMessage({
  poll,
  isMine,
  onVote,
}: PollMessageProps) {
  const totalVotes = Object.values(poll.votes).reduce(
    (sum, voters) => sum + voters.length,
    0
  );

  const getUserVotes = () => {
    const myVotes: number[] = [];
    Object.entries(poll.votes).forEach(([optionIndex, voters]) => {
      if (voters.includes("me")) {
        myVotes.push(parseInt(optionIndex));
      }
    });
    return myVotes;
  };

  const myVotes = getUserVotes();

  const getVoteCount = (optionIndex: number) => {
    return poll.votes[optionIndex]?.length || 0;
  };

  const getVotePercentage = (optionIndex: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((getVoteCount(optionIndex) / totalVotes) * 100);
  };

  const isOptionVoted = (optionIndex: number) => {
    return myVotes.includes(optionIndex);
  };

  const canVote = (optionIndex: number) => {
    if (poll.allowMultiple) return true;
    return myVotes.length === 0 || isOptionVoted(optionIndex);
  };

  return (
    <View
      style={[
        styles.container,
        isMine ? styles.containerMine : styles.containerTheirs,
      ]}
    >
      {/* Question */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="poll" size={20} color="#6D5FFD" />
        <Text style={styles.question}>{poll.question}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {poll.options.map((option, index) => {
          const voteCount = getVoteCount(index);
          const percentage = getVotePercentage(index);
          const voted = isOptionVoted(index);
          const enabled = canVote(index);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                voted && styles.optionButtonVoted,
                !enabled && styles.optionButtonDisabled,
              ]}
              onPress={() => enabled && onVote(index)}
              disabled={!enabled}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  <View
                    style={[styles.checkbox, voted && styles.checkboxVoted]}
                  >
                    {voted && (
                      <MaterialCommunityIcons
                        name="check"
                        size={14}
                        color="#FFFFFF"
                      />
                    )}
                  </View>
                  <Text
                    style={[styles.optionText, voted && styles.optionTextVoted]}
                  >
                    {option}
                  </Text>
                </View>

                {totalVotes > 0 && (
                  <Text style={styles.voteCount}>
                    {voteCount} ({percentage}%)
                  </Text>
                )}
              </View>

              {/* Progress bar */}
              {totalVotes > 0 && (
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      voted && styles.progressBarFillVoted,
                      { width: `${percentage}%` },
                    ]}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <MaterialCommunityIcons
          name="account-multiple"
          size={14}
          color="#757575"
        />
        <Text style={styles.footerText}>
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
        </Text>
        {poll.allowMultiple && (
          <>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.footerText}>Multiple answers</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 12,
    minWidth: 250,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  containerMine: {
    backgroundColor: "#E8E3FF",
    borderColor: "#D0C9FF",
  },
  containerTheirs: {
    backgroundColor: "#F8F8F8",
    borderColor: "#E0E0E0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  optionButtonVoted: {
    backgroundColor: "#F0EDFF",
    borderColor: "#6D5FFD",
  },
  optionButtonDisabled: {
    opacity: 0.5,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#BDBDBD",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxVoted: {
    backgroundColor: "#6D5FFD",
    borderColor: "#6D5FFD",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: "#424242",
  },
  optionTextVoted: {
    fontWeight: "600",
    color: "#6D5FFD",
  },
  voteCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#757575",
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#BDBDBD",
    borderRadius: 2,
  },
  progressBarFillVoted: {
    backgroundColor: "#6D5FFD",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  footerText: {
    fontSize: 12,
    color: "#757575",
  },
  separator: {
    fontSize: 12,
    color: "#BDBDBD",
  },
});
