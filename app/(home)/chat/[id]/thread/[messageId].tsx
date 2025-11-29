import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Channel as ChannelType } from "stream-chat";
import {
  Channel,
  DeepPartial,
  MessageList,
  Theme,
  useChatContext,
} from "stream-chat-expo";

import AttachButton from "@/components/AttachButton";
import Button from "@/components/Button";
import CustomMessageInput from "@/components/CustomMessageInput";
import MessageAvatar from "@/components/MessageAvatar";
import MessageContent from "@/components/MessageContent";
import PreviewAvatar from "@/components/PreviewAvatar";
import Screen from "@/components/Screen";
import ScreenLoading from "@/components/ScreenLoading";
import SendButton from "@/components/SendButton";

const myMessageTheme: DeepPartial<Theme> = {
  messageSimple: {
    content: {
      senderMessageBackgroundColor: "#175dee",
      markdown: {
        text: {
          color: "white",
        },
      },
      container: {
        paddingVertical: 0,
        paddingHorizontal: 0,
      },
    },
  },
};

const ThreadScreen = () => {
  const { id: channelId, messageId } = useLocalSearchParams<{
    id: string;
    messageId: string;
  }>();
  const { client: chatClient } = useChatContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [channel, setChannel] = useState<ChannelType>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadThread = async () => {
      try {
        const channel = chatClient.channel("messaging", channelId);
        await channel.watch();
        setChannel(channel);
        setLoading(false);
      } catch (error) {
        console.error("Error loading thread:", error);
        setLoading(false);
      }
    };

    if (chatClient && channelId && messageId) {
      loadThread();
    }
  }, [channelId, messageId, chatClient]);

  // Create dynamic theme with safe area bottom inset
  const dynamicMessageInputTheme: DeepPartial<Theme> = {
    ...myMessageTheme,
    messageInput: {
      container: {
        borderTopWidth: 0,
        paddingHorizontal: 0,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 0,
        backgroundColor: "transparent",
        marginBottom: 0,
      },
      inputBoxContainer: {
        backgroundColor: "#eeeeef",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderColor: "#eeeeef",
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 0,
        minHeight: 40,
      },
    },
  };

  if (loading) {
    return <ScreenLoading />;
  }

  if (!channel) {
    return null;
  }

  return (
    <Screen
      style={styles.screen}
      viewStyle={styles.view}
      edges={["top", "left", "right", "bottom"]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Button variant="plain" onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </Button>
          <View style={styles.headerInfo}>
            <PreviewAvatar channel={channel} size={28} fontSize={14} />
            <View style={styles.threadInfo}>
              <Ionicons name="chatbubbles" size={16} color="#666" />
              <Text style={styles.threadLabel}>Thread</Text>
            </View>
          </View>
        </View>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={{ flex: 1 }}>
          <Channel
            myMessageTheme={dynamicMessageInputTheme}
            channel={channel}
            keyboardVerticalOffset={0}
            keyboardBehavior={
              Platform.OS === "android" ? "padding" : undefined
            }
            hasCommands={false}
            AttachButton={AttachButton}
            SendButton={SendButton}
            MessageAvatar={MessageAvatar}
            MessageContent={MessageContent}
            reactionListPosition="bottom"
          >
            <MessageList
              threadList={true}
              parentId={messageId}
              noGroupByUser={true}
            />
            <CustomMessageInput parentId={messageId} />
          </Channel>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "white",
  },
  view: {
    paddingBottom: 0,
  },
  header: {
    paddingLeft: 4,
    paddingRight: 16,
    paddingBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#e9e9e9",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  threadInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  threadLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});

export default ThreadScreen;

