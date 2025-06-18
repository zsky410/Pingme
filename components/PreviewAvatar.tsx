import type { Channel } from 'stream-chat';
import Avatar from './Avatar';

const PreviewAvatar = ({ channel }: { channel: Channel }) => {
  const isDMChannel = channel?.id?.startsWith('!members');
  // @ts-expect-error - channel?.data?.name can be undefined
  const channelName = channel?.data.name;
  // @ts-expect-error - channel?.data?.image can be undefined
  const channelImage = channel?.data?.image;
  const placeholderType = isDMChannel ? 'text' : 'icon';

  return (
    <Avatar
      size={40}
      name={channelName}
      fontSize={20}
      imageUrl={channelImage}
      placeholderType={placeholderType}
    />
  );
};

export default PreviewAvatar;
