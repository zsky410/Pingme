import React from 'react';
import { Text, View } from 'react-native';
import { useChannelContext } from 'stream-chat-expo';

import { useUser } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons';
import { checkIfDMChannel, getChannelName } from '../lib/utils';
import Avatar from './Avatar';

const MessageListHeader = () => {
  const { channel } = useChannelContext();
  const { user } = useUser();

  const userId = user?.id!;
  const channelName = getChannelName(channel, userId);
  const isDMChannel = checkIfDMChannel(channel);
  const placeholderType = isDMChannel ? 'text' : 'icon';

  const text = isDMChannel
    ? `This conversation is just between ${channelName} and you`
    : 'This conversation is just between the members of this channel';

  return (
    <View className="items-center gap-3 mt-14 mb-8">
      <Avatar
        placeholderType={placeholderType}
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
