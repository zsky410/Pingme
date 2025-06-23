import clsx from 'clsx';
import { SafeAreaView, View } from 'react-native';

import LoadingOverlay from './LoadingOverlay';

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
  viewClassName?: string;
  loadingOverlay?: boolean;
}

const Screen = ({
  children,
  className,
  viewClassName,
  loadingOverlay = false,
}: ScreenProps) => {
  return (
    <>
      <SafeAreaView className={clsx('flex-1', className)}>
        <View className={clsx('flex-1', viewClassName)}>{children}</View>
      </SafeAreaView>
      {loadingOverlay && <LoadingOverlay />}
    </>
  );
};

export default Screen;
