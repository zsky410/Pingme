import Feather from "@expo/vector-icons/Feather";
import { useFocusEffect } from "@react-navigation/native";
import { Link, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Channel } from "stream-chat";
import { ChannelList, useChatContext } from "stream-chat-expo";

import Button from "@/components/Button";
import PreviewAvatar from "@/components/PreviewAvatar";
import Screen from "@/components/Screen";
import ScreenLoading from "@/components/ScreenLoading";

const ChatsScreen = () => {
  const { client } = useChatContext();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh channel list when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Force refresh by updating key, which will cause ChannelList to re-render
      setRefreshKey((prev) => prev + 1);

      // Also query channels to ensure we have latest data
      const refreshChannels = async () => {
        try {
          await client.queryChannels({
            type: "messaging",
            members: { $in: [client.userID!] },
          });
        } catch (error) {
          console.error("Error refreshing channels:", error);
        }
      };

      refreshChannels();
    }, [client])
  );

  const goToChannel = (channel: Channel) => {
    router.navigate({
      pathname: "/chat/[id]",
      params: { id: channel.id! },
    });
  };

  return (
    <Screen style={styles.screen} viewStyle={styles.view}>
      <View style={styles.header}>
        <View style={styles.actions}>
          <Link href="/find-by-username" asChild>
            <Button variant="plain">
              <Feather name="search" size={20} />
            </Button>
          </Link>
        </View>
      </View>
      <ChannelList
        key={refreshKey}
        filters={{
          type: "messaging",
          members: { $in: [client.userID!] },
        }}
        sort={{ last_message_at: -1 }}
        onSelect={goToChannel}
        LoadingIndicator={ScreenLoading}
        PreviewAvatar={PreviewAvatar}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "white",
  },
  view: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
    height: 40,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});

export default ChatsScreen;
