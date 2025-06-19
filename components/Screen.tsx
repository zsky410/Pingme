import clsx from 'clsx';
import { SafeAreaView, View } from 'react-native';
import LoadingOverlay from './LoadingOverlay';

interface ScreenProps {
  children: React.ReactNode;
  headerAbove?: boolean;
  className?: string;
  viewClassName?: string;
  loadingOverlay?: boolean;
}

function Screen({
  children,
  headerAbove,
  className,
  viewClassName,
  loadingOverlay = false,
}: ScreenProps) {
  const headerAboveStyle = headerAbove ? 'pt-0' : 'pt-safe';

  return (
    <>
      <SafeAreaView className={clsx('flex-1', headerAboveStyle, className)}>
        <View className={clsx('flex-1', viewClassName)}>{children}</View>
      </SafeAreaView>
      {loadingOverlay && <LoadingOverlay />}
    </>
  );
}

export default Screen;
