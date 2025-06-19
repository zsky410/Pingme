import { useUser } from '@clerk/clerk-expo';
import { ChannelAvatarProps } from 'stream-chat-expo';

import { checkIfDMChannel, getChannelName } from '@/lib/utils';
import Avatar from './Avatar';

const PreviewAvatar = ({ channel, size }: ChannelAvatarProps) => {
  const { user } = useUser();

  const userId = user?.id!;
  const channelName = getChannelName(channel, userId);
  const isDMChannel = checkIfDMChannel(channel);

  // @ts-expect-error - channel?.data?.image can be undefined
  const channelImage = channel?.data?.image;
  const placeholderType = isDMChannel ? 'text' : 'icon';

  return (
    <Avatar
      size={44}
      name={channelName}
      fontSize={20}
      imageUrl={channelImage}
      placeholderType={placeholderType}
    />
  );
};

export default PreviewAvatar;
