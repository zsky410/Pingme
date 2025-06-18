import React from 'react';
import { Text, View } from 'react-native';
import { useChannelContext } from 'stream-chat-expo';

import { MaterialIcons } from '@expo/vector-icons';
import Avatar from './Avatar';

const MessageListHeader = () => {
  const { channel } = useChannelContext();
  // @ts-expect-error - channel?.data?.name can be undefined
  const channelName = channel?.data?.name || 'Channel';
  const isDMChannel = channel?.id?.startsWith('!members');

  const text = isDMChannel
    ? `This conversation is just between ${channel?.data?.members?.filter(
        (m) => m !== channel._client.userID
      )} and you`
    : 'This conversation is just between the members of this channel';

  return (
    <View className="items-center gap-3 mt-14 mb-8">
      <Avatar
        placeholderType="icon"
        size={80}
        fontSize={40}
        name={channelName}
      />
      <Text className="text-2xl font-semibold">{channelName}</Text>
      <View className="w-[280px] items-start justify-center inline-flex flex-row px-6 py-4 bg-white rounded-xl border-[2px] border-gray-100 shadow shadow-gray-100">
        <MaterialIcons name="people-outline" size={18} color="black" />
        <Text className="text-center">{text}</Text>
      </View>
    </View>
  );
};

export default MessageListHeader;
