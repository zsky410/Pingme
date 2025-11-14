import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCalls } from "@stream-io/video-react-native-sdk";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
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
import ChannelTitle from "@/components/ChannelTitle";
import CustomMessageInput from "@/components/CustomMessageInput";
import MessageAvatar from "@/components/MessageAvatar";
import MessageContent from "@/components/MessageContent";
import MessageListHeader from "@/components/MessageListHeader";
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

const ChatScreen = () => {
  const { id: channelId } = useLocalSearchParams<{ id: string }>();
  const { client: chatClient } = useChatContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [channel, setChannel] = useState<ChannelType>();
  const [loading, setLoading] = useState(true);
  const [activeCall] = useCalls();

  useEffect(() => {
    const loadChannel = async () => {
      const channel = chatClient.channel("messaging", channelId);
      await channel.watch();

      setChannel(channel);
      setLoading(false);
    };

    if (chatClient && !channel) loadChannel();
  }, [channelId, channel, chatClient]);

  const startAudioCall = async () => {
    router.navigate({
      pathname: `/call/[id]`,
      params: { id: channelId, updateCall: "true" },
    });
  };

  const startVideoCall = async () => {
    router.navigate({
      pathname: `/call/[id]`,
      params: { id: channelId, updateCall: "true", video: "true" },
    });
  };

  const callIsActive = !!activeCall && activeCall?.id !== channelId;

  if (loading) {
    return <ScreenLoading />;
  }

  return (
    <Screen
      style={styles.screen}
      viewStyle={styles.view}
      edges={["top", "left", "right"]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Button variant="plain" onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </Button>
          <PreviewAvatar channel={channel!} size={28} fontSize={14} />
          <ChannelTitle channel={channel!} />
        </View>
        <View style={styles.headerRight}>
          <Button
            variant="plain"
            onPress={startVideoCall}
            disabled={callIsActive}
          >
            <Feather name="video" size={24} color="black" />
          </Button>
          <Button
            variant="plain"
            onPress={startAudioCall}
            disabled={callIsActive}
          >
            <Feather name="phone" size={22} color="black" />
          </Button>
        </View>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={{ flex: 1 }}>
          <Channel
            myMessageTheme={myMessageTheme}
            channel={channel!}
            keyboardVerticalOffset={0}
            keyboardBehavior={Platform.OS === "android" ? "padding" : undefined}
            hasCommands={false}
            AttachButton={AttachButton}
            SendButton={SendButton}
            EmptyStateIndicator={MessageListHeader}
            MessageAvatar={MessageAvatar}
            MessageContent={MessageContent}
            reactionListPosition="bottom"
          >
            <MessageList FooterComponent={MessageListHeader} />
            <View style={{ paddingBottom: insets.bottom }}>
              <CustomMessageInput />
            </View>
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
    paddingBottom: 0, // SafeAreaView sẽ xử lý
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
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
});

export default ChatScreen;
