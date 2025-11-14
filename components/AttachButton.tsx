import { Feather } from '@expo/vector-icons';
import { AttachButtonProps, useMessageInputContext } from 'stream-chat-expo';

import Button from './Button';

const AttachButton = ({ disabled }: AttachButtonProps) => {
  const { toggleAttachmentPicker, selectedPicker } = useMessageInputContext();
  const isActive = selectedPicker === 'images';

  return (
    <Button
      variant="plain"
      disabled={disabled}
      onPress={toggleAttachmentPicker}
      style={{
        padding: 2,
        transform: [{ rotate: isActive ? '45deg' : '0deg' }],
        backgroundColor: isActive ? '#4B5563' : 'transparent',
        borderRadius: isActive ? 9999 : 0,
      }}
    >
      <Feather name="plus" size={24} color={isActive ? 'white' : 'black'} />
    </Button>
  );
};

export default AttachButton;
