import { DimensionValue, TextInput } from 'react-native';

interface TextFieldProps extends React.ComponentProps<typeof TextInput> {
  width?: DimensionValue;
}

const TextField = ({ width = '100%', ...otherProps }: TextFieldProps) => {
  return (
    <TextInput
      style={{ width }}
      className="bg-transparent flex-row items-center rounded-xl px-4 py-3 border border-gray-300 dark:border-gray-600"
      {...otherProps}
    />
  );
};

export default TextField;
