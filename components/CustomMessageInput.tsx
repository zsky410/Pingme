import { TextComposerState } from 'stream-chat';
import {
  MessageInput,
  useAttachmentManagerState,
  useMessageComposer,
  useStateStore,
} from 'stream-chat-expo';

const textComposerStateSelector = (state: TextComposerState) => ({
  text: state.text,
});

const CustomMessageInput = () => {
  const { textComposer } = useMessageComposer();
  const { text } = useStateStore(textComposer.state, textComposerStateSelector);
  const { attachments } = useAttachmentManagerState();

  const audioRecordingEnabled = !text && attachments.length === 0;
  return <MessageInput audioRecordingEnabled={audioRecordingEnabled} />;
};

export default CustomMessageInput;
