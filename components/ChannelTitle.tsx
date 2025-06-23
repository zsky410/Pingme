import { Text } from 'react-native';
import { Channel } from 'stream-chat';
import { useChannelPreviewDisplayName } from 'stream-chat-expo';

interface ChannelTitleProps {
  channel: Channel;
  className?: string;
}

const ChannelTitle = ({
  channel,
  className = 'text-base font-bold',
}: ChannelTitleProps) => {
  const channelName = useChannelPreviewDisplayName(channel);
  return <Text className={className}>{channelName}</Text>;
};

export default ChannelTitle;
