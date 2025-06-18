import { ActivityIndicator } from 'react-native';

import Screen from './Screen';

const ScreenLoading = () => {
  return (
    <Screen className="bg-white" viewClassName="items-center justify-center">
      <ActivityIndicator color="#2c6bed" />
    </Screen>
  );
};

export default ScreenLoading;
