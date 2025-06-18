import { Feather } from '@expo/vector-icons';
import clsx from 'clsx';
import { AttachButtonProps, useMessageInputContext } from 'stream-chat-expo';
import Button from './Button';

const AttachButton = ({ disabled }: AttachButtonProps) => {
  const { toggleAttachmentPicker, selectedPicker } = useMessageInputContext();
  const isActive = selectedPicker === 'images';

  return (
    <Button
      variant="icon"
      disabled={disabled}
      onPress={toggleAttachmentPicker}
      className={clsx(
        'p-0.5 rotate-[0deg]',
        isActive && 'bg-gray-600 rounded-full rotate-[45deg]'
      )}
    >
      <Feather name="plus" size={24} color={isActive ? 'white' : 'black'} />
    </Button>
  );
};

export default AttachButton;
