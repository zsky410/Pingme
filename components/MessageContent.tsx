import { StyleSheet, Text, View } from 'react-native';
import { MessageContent as StreamMessageContent, useMessageContext } from 'stream-chat-expo';

import Avatar from './Avatar';
import QuotedMessage from './QuotedMessage';

const MessageContent = (props: any) => {
  const { message, alignment } = useMessageContext();
  const hasQuotedMessage = !!message?.quoted_message;

  return (
    <View>
      {hasQuotedMessage && <QuotedMessage />}
      <StreamMessageContent {...props} />
    </View>
  );
};

export default MessageContent;

