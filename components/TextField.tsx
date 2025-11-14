import { DimensionValue, Platform, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle, TextStyle } from 'react-native';

interface TextFieldProps extends TextInputProps {
  width?: DimensionValue;
  label?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

const TextField = ({
  label,
  width = '100%',
  style,
  inputStyle,
  ...otherProps
}: TextFieldProps) => {
  return (
    <View
      style={[styles.container, { width }, style]}
    >
      {label && (
        <View>
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
      <TextInput
        style={[styles.input, inputStyle]}
        placeholderTextColor="#9CA3AF"
        {...otherProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingHorizontal: 16,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: Platform.OS === 'android' ? 0 : 12,
    borderWidth: 1,
    borderColor: 'white',
  },
  label: {
    width: 108,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    color: 'black',
  },
});

export default TextField;
