import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePolls } from "@/contexts/PollContext";

export default function CreatePoll() {
  const router = useRouter();
  const { chatId } = useLocalSearchParams();
  const { addPollToChat } = usePolls();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    } else {
      Alert.alert("Limit Reached", "You can add up to 10 options");
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    } else {
      Alert.alert("Minimum Required", "You need at least 2 options");
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    // Validate
    if (!question.trim()) {
      Alert.alert("Error", "Please enter a question");
      return;
    }

    const filledOptions = options.filter((opt) => opt.trim() !== "");
    if (filledOptions.length < 2) {
      Alert.alert("Error", "Please provide at least 2 options");
      return;
    }

    // Create poll object
    const newPoll = {
      id: `poll-${Date.now()}`,
      question: question.trim(),
      options: filledOptions,
      allowMultiple,
      votes: {},
      createdBy: "me",
      createdAt: new Date().toISOString(),
    };

    // Add poll to chat via context
    if (chatId && typeof chatId === "string") {
      addPollToChat(chatId, newPoll);
    }

    // Navigate back
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="close" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Poll</Text>
        <TouchableOpacity onPress={handleCreate} style={styles.createButton}>
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Question</Text>
          <TextInput
            style={styles.questionInput}
            placeholder="Ask a question..."
            placeholderTextColor="#9E9E9E"
            value={question}
            onChangeText={setQuestion}
            multiline
          />
        </View>

        {/* Options Section */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Options</Text>
            <Text style={styles.optionCount}>{options.length}/10</Text>
          </View>

          {options.map((option, index) => (
            <View key={index} style={styles.optionRow}>
              <View style={styles.optionNumber}>
                <Text style={styles.optionNumberText}>{index + 1}</Text>
              </View>
              <TextInput
                style={styles.optionInput}
                placeholder={`Option ${index + 1}`}
                placeholderTextColor="#9E9E9E"
                value={option}
                onChangeText={(text) => updateOption(index, text)}
              />
              {options.length > 2 && (
                <TouchableOpacity
                  onPress={() => removeOption(index)}
                  style={styles.removeButton}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color="#F44336"
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {options.length < 10 && (
            <TouchableOpacity
              onPress={addOption}
              style={styles.addOptionButton}
            >
              <MaterialCommunityIcons
                name="plus-circle-outline"
                size={20}
                color="#6D5FFD"
              />
              <Text style={styles.addOptionText}>Add Option</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Settings</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setAllowMultiple(!allowMultiple)}
          >
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons
                name="checkbox-multiple-marked-outline"
                size={24}
                color="#6D5FFD"
              />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Allow Multiple Answers</Text>
                <Text style={styles.settingDescription}>
                  Users can select more than one option
                </Text>
              </View>
            </View>
            <View style={[styles.toggle, allowMultiple && styles.toggleActive]}>
              <View
                style={[
                  styles.toggleThumb,
                  allowMultiple && styles.toggleThumbActive,
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <MaterialCommunityIcons
            name="information"
            size={16}
            color="#757575"
          />
          <Text style={styles.infoText}>
            Polls are anonymous. Results will be visible to all group members.
          </Text>
        </View>
      </ScrollView>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  createButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6D5FFD",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 8,
    borderBottomColor: "#F8F8F8",
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  optionCount: {
    fontSize: 14,
    color: "#757575",
  },
  questionInput: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#000000",
    minHeight: 100,
    textAlignVertical: "top",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  optionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0EDFF",
    alignItems: "center",
    justifyContent: "center",
  },
  optionNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6D5FFD",
  },
  optionInput: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#000000",
  },
  removeButton: {
    padding: 4,
  },
  addOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
  },
  addOptionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6D5FFD",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: "#757575",
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0E0E0",
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: "#6D5FFD",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#757575",
    lineHeight: 18,
  },
});
