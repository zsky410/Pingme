import { Image, ImageProps } from 'expo-image';
import { cssInterop } from 'nativewind';

const AppImage = (props: ImageProps) => {
  const StyledImage = cssInterop(Image, {
    className: {
      target: 'style',
    },
  });

  return <StyledImage {...props} />;
};

export default AppImage;
