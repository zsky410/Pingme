import { ToggleVideoPublishingButton } from '@stream-io/video-react-native-sdk';
import { View } from 'react-native';

const ToggleVideo = () => {
  return (
    <View className="w-12 h-12 rounded-full items-center justify-center bg-[#373737] p-4">
      <ToggleVideoPublishingButton />
    </View>
  );
};

export default ToggleVideo;
