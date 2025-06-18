import clsx from 'clsx';
import { Text, TouchableOpacity } from 'react-native';

interface ButtonProps extends React.ComponentProps<typeof TouchableOpacity> {
  onPress?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'icon' | 'default' | 'text';
}

function Button({
  onPress,
  children,
  className,
  variant = 'default',
  ...otherProps
}: ButtonProps) {
  if (variant === 'icon')
    return (
      <TouchableOpacity
        className={clsx('justify-center items-center w-fit h-fit', className)}
        onPress={onPress}
        {...otherProps}
      >
        {children}
      </TouchableOpacity>
    );

  return (
    <TouchableOpacity
      className={clsx(
        variant === 'default' &&
          'bg-blue-600 rounded-[13px] justify-center items-center px-4 py-4 w-full',
        variant === 'text' && 'bg-transparent justify-center items-center',
        className
      )}
      onPress={onPress}
      {...otherProps}
    >
      <Text
        className={clsx(
          variant === 'default' && 'text-[17px] font-medium text-white',
          variant === 'text' && 'text-sm text-black'
        )}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

export default Button;
