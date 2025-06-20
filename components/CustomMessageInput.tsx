import { MessageInput, useMessageInputContext } from 'stream-chat-expo';

const CustomMessageInput = () => {
  const { text, numberOfUploads } = useMessageInputContext();
  return (
    <MessageInput audioRecordingEnabled={!text && numberOfUploads === 0} />
  );
};

export default CustomMessageInput;
