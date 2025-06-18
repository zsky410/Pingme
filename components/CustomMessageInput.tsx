import { MessageInput, useMessageInputContext } from 'stream-chat-expo';

const CustomMessageInput = () => {
  const { text } = useMessageInputContext();
  return <MessageInput audioRecordingEnabled={!text} />;
};

export default CustomMessageInput;
