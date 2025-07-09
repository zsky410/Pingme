import { Feather } from '@expo/vector-icons';
import clsx from 'clsx';
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
      className={clsx('p-0.5 bg-primary rounded-full')}
    >
      <Feather name="arrow-up" size={24} color="white" />
    </Button>
  );
};

export default SendButton;
