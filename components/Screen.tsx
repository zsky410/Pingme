import clsx from 'clsx';
import { SafeAreaView, View } from 'react-native';

interface ScreenProps {
  children: React.ReactNode;
  headerAbove?: boolean;
  className?: string;
  viewClassName?: string;
}

function Screen({
  children,
  headerAbove,
  className,
  viewClassName,
}: ScreenProps) {
  const headerAboveStyle = headerAbove ? 'pt-0' : 'pt-safe';

  return (
    <SafeAreaView className={clsx('flex-1', headerAboveStyle, className)}>
      <View className={clsx('flex-1', viewClassName)}>{children}</View>
    </SafeAreaView>
  );
}

export default Screen;
