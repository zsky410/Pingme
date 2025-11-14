import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps extends React.ComponentProps<typeof TouchableOpacity> {
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'plain' | 'default' | 'text';
}

const Button = ({
  onPress,
  children,
  style,
  variant = 'default',
  ...otherProps
}: ButtonProps) => {
  if (variant === 'plain') {
    return (
      <TouchableOpacity
        style={[styles.plain, style]}
        onPress={onPress}
        {...otherProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  const buttonStyle = [
    variant === 'default' && styles.default,
    variant === 'text' && styles.text,
    otherProps.disabled && styles.disabled,
    style,
  ].filter(Boolean);

  const textStyle: TextStyle[] = [
    variant === 'default' && styles.defaultText,
    variant === 'text' && styles.textLabel,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      {...otherProps}
    >
      <Text style={textStyle}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  plain: {
    width: 'auto',
    height: 'auto',
  },
  default: {
    backgroundColor: '#2563eb',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    width: '100%',
  },
  text: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  defaultText: {
    fontSize: 17,
    fontWeight: '500',
    color: 'white',
  },
  textLabel: {
    fontSize: 14,
    color: 'black',
  },
});

export default Button;
