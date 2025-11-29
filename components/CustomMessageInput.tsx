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

interface CustomMessageInputProps {
  parentId?: string;
}

const CustomMessageInput = ({ parentId }: CustomMessageInputProps) => {
  const { textComposer } = useMessageComposer();
  const { text } = useStateStore(textComposer.state, textComposerStateSelector);
  const { attachments } = useAttachmentManagerState();

  const audioRecordingEnabled = !text && attachments.length === 0;
  return <MessageInput audioRecordingEnabled={audioRecordingEnabled} parentId={parentId} />;
};

export default CustomMessageInput;
