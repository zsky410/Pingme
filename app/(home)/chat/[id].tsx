import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Channel as ChannelType } from 'stream-chat';
import {
  Channel,
  DeepPartial,
  MessageList,
  Theme,
  useChatContext,
} from 'stream-chat-expo';

import AttachButton from '@/components/AttachButton';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import CustomMessageInput from '@/components/CustomMessageInput';
import MessageListHeader from '@/components/MessageListHeader';
import Screen from '@/components/Screen';
import ScreenLoading from '@/components/ScreenLoading';
import SendButton from '@/components/SendButton';
import MessageAvatar from '../../../components/MessageAvatar';

const myMessageTheme: DeepPartial<Theme> = {
  messageSimple: {
    content: {
      senderMessageBackgroundColor: '#175dee',
      markdown: {
        text: {
          color: 'white',
        },
      },
    },
  },
};

const ChatScreen = () => {
  const { id: channelId } = useLocalSearchParams<{ id: string }>();
  const { client: chatClient } = useChatContext();
  const router = useRouter();

  const [channel, setChannel] = useState<ChannelType>();
  const [loading, setLoading] = useState(true);
  // @ts-expect-error - channel?.data?.name can be undefined
  const channelName = channel?.data?.name || 'Channel';
  const isDMChannel = channel?.id?.startsWith('!members');

  useEffect(() => {
    const loadChannel = async () => {
      const channel = chatClient.channel('messaging', channelId);
      await channel.watch();

      setChannel(channel);
      setLoading(false);
    };

    if (chatClient && !channel) loadChannel();
  }, [channelId, channel, chatClient]);

  if (loading) {
    return <ScreenLoading />;
  }

  return (
    <Screen className="flex-1 bg-white" viewClassName="pb-safe">
      <View className="pl-1 pr-4 flex flex-row items-center justify-between w-full h-8">
        <View className="flex flex-row items-center gap-4">
          <Button variant="icon" onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </Button>
          <Avatar
            placeholderType={isDMChannel ? 'text' : 'icon'}
            size={28}
            fontSize={14}
            name={channelName}
          />
          <Text className="text-base font-bold">{channelName}</Text>
        </View>
        <View className="flex flex-row items-center gap-6">
          <Button variant="icon" onPress={() => null}>
            <Feather name="video" size={24} color="black" />
          </Button>
          <Button variant="icon" onPress={() => null}>
            <Ionicons name="call-outline" size={24} color="black" />
          </Button>
        </View>
      </View>
      <Channel
        myMessageTheme={myMessageTheme}
        channel={channel!}
        keyboardVerticalOffset={0}
        autoCompleteTriggerSettings={() => ({})}
        hasCommands={false}
        AttachButton={AttachButton}
        SendButton={SendButton}
        EmptyStateIndicator={MessageListHeader}
        MessageAvatar={MessageAvatar}
      >
        <MessageList FooterComponent={MessageListHeader} />
        <CustomMessageInput />
      </Channel>
    </Screen>
  );
};

export default ChatScreen;
