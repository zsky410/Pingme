import { View } from 'react-native';
import { useMessageContext, useTheme } from 'stream-chat-expo';

import Avatar from './Avatar';

const MessageAvatar = () => {
  const { alignment, lastGroupMessage, message, showAvatar } =
    useMessageContext();
  const {
    theme: {
      messageSimple: {
        avatarWrapper: { container, leftAlign, rightAlign, spacer },
      },
    },
  } = useTheme();

  const visible =
    typeof showAvatar === 'boolean' ? showAvatar : lastGroupMessage;

  if (!visible) return <View style={spacer} />;

  return (
    <View style={[alignment === 'left' ? leftAlign : rightAlign, container]}>
      <Avatar
        size={28}
        name={message?.user?.name!}
        fontSize={14}
        imageUrl={message?.user?.image}
        placeholderType="text"
      />
    </View>
  );
};

export default MessageAvatar;
