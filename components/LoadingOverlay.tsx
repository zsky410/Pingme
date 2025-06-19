import { View } from 'react-native';

import Spinner from './Spinner';

const LoadingOverlay = () => {
  return (
    <View className="absolute inset-0 bg-black/40 items-center justify-center z-50">
      <Spinner color="white" />
    </View>
  );
};

export default LoadingOverlay;
