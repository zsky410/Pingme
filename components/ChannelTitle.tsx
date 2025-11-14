import { StyleSheet, Text, TextStyle } from 'react-native';
import { Channel } from 'stream-chat';
import { useChannelPreviewDisplayName } from 'stream-chat-expo';

interface ChannelTitleProps {
  channel: Channel;
  style?: TextStyle;
}

const ChannelTitle = ({
  channel,
  style,
}: ChannelTitleProps) => {
  const channelName = useChannelPreviewDisplayName(channel);
  return <Text style={[styles.default, style]}>{channelName}</Text>;
};

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ChannelTitle;
