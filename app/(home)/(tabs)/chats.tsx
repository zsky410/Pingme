import Feather from "@expo/vector-icons/Feather";
import { Link, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Channel } from "stream-chat";
import { ChannelList, useChatContext } from "stream-chat-expo";

import AppMenu from "@/components/AppMenu";
import Button from "@/components/Button";
import PreviewAvatar from "@/components/PreviewAvatar";
import Screen from "@/components/Screen";
import ScreenLoading from "@/components/ScreenLoading";

const ChatsScreen = () => {
  const { client } = useChatContext();
  const router = useRouter();

  const goToChannel = (channel: Channel) => {
    router.navigate({
      pathname: "/chat/[id]",
      params: { id: channel.id! },
    });
  };

  return (
    <Screen style={styles.screen} viewStyle={styles.view}>
      <View style={styles.header}>
        <AppMenu />
        <View style={styles.actions}>
          <Button variant="plain">
            <Feather name="camera" size={20} />
          </Button>
          <Link href="/new-message" asChild>
            <Button variant="plain" style={styles.editButton}>
              <Feather name="edit" size={18} />
            </Button>
          </Link>
        </View>
      </View>
      <ChannelList
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
    justifyContent: "space-between",
    width: "100%",
    height: 40,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  editButton: {
    paddingLeft: 16,
    paddingVertical: 4,
  },
});

export default ChatsScreen;
