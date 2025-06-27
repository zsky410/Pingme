import { MessageInput, useMessageInputContext } from 'stream-chat-expo';

const CustomMessageInput = () => {
  const { text, numberOfUploads } = useMessageInputContext();
  const audioRecordingEnabled = !text && numberOfUploads === 0;
  return <MessageInput audioRecordingEnabled={audioRecordingEnabled} />;
};

export default CustomMessageInput;
