import {
  ChannelAvatarProps,
  useChannelPreviewDisplayAvatar,
} from 'stream-chat-expo';

import { checkIfDMChannel } from '@/lib/utils';
import Avatar from './Avatar';

export interface PreviewAvatarProps extends ChannelAvatarProps {
  size?: number;
  fontSize?: number;
}

const PreviewAvatar = ({
  channel,
  size = 44,
  fontSize = 20,
}: PreviewAvatarProps) => {
  const isDMChannel = checkIfDMChannel(channel);
  const displayAvatar = useChannelPreviewDisplayAvatar(channel);
  const placeholderType = isDMChannel ? 'text' : 'icon';

  return (
    <Avatar
      size={size}
      name={displayAvatar.name!}
      fontSize={fontSize}
      imageUrl={isDMChannel ? displayAvatar.image : undefined}
      placeholderType={placeholderType}
    />
  );
};

export default PreviewAvatar;
