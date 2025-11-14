import { Feather } from '@expo/vector-icons';
import {
  useAttachmentManagerState,
  useMessageComposer,
  useMessageInputContext,
  useStateStore,
} from 'stream-chat-expo';

import { TextComposerState } from 'stream-chat';
import Button from './Button';

const textComposerStateSelector = (state: TextComposerState) => ({
  text: state.text,
});

const SendButton = () => {
  const { sendMessage } = useMessageInputContext();
  const { textComposer } = useMessageComposer();
  const { text } = useStateStore(textComposer.state, textComposerStateSelector);
  const { attachments } = useAttachmentManagerState();

  if (!text && attachments.length === 0) return null;

  return (
    <Button
      variant="plain"
      onPress={sendMessage}
      style={{
        padding: 2,
        backgroundColor: '#2c6bed',
        borderRadius: 9999,
      }}
    >
      <Feather name="arrow-up" size={24} color="white" />
    </Button>
  );
};

export default SendButton;
