import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import {
  useChannelContext,
  useChannelPreviewDisplayName,
} from 'stream-chat-expo';

import { checkIfDMChannel } from '../lib/utils';
import ChannelTitle from './ChannelTitle';
import PreviewAvatar from './PreviewAvatar';

const MessageListHeader = () => {
  const { channel } = useChannelContext();
  const channelName = useChannelPreviewDisplayName(channel);
  const isDMChannel = checkIfDMChannel(channel);

  const text = isDMChannel
    ? `This conversation is just between ${channelName} and you`
    : 'This conversation is just between the members of this channel';

  return (
    <View className="items-center gap-3 mt-14 mb-8">
      <PreviewAvatar channel={channel!} size={80} fontSize={40} />
      <ChannelTitle channel={channel} className="text-2xl font-semibold" />
      <View className="w-[280px] items-start justify-center inline-flex flex-row px-6 py-4 bg-white rounded-xl border-[2px] border-gray-100 shadow shadow-gray-100">
        <MaterialIcons name="people-outline" size={18} color="black" />
        <Text className="text-center">{text}</Text>
      </View>
    </View>
  );
};

export default MessageListHeader;
