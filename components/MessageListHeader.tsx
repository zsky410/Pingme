import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
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
    <View style={styles.container}>
      <PreviewAvatar channel={channel!} size={80} fontSize={40} />
      <ChannelTitle channel={channel} style={styles.title} />
      <View style={styles.infoBox}>
        <MaterialIcons name="people-outline" size={18} color="black" />
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    marginTop: 56,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  infoBox: {
    width: 280,
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    textAlign: 'center',
  },
});

export default MessageListHeader;
