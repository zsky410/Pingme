import { ToggleVideoPublishingButton } from '@stream-io/video-react-native-sdk';
import { StyleSheet, View } from 'react-native';

const ToggleVideo = () => {
  return (
    <View style={styles.container}>
      <ToggleVideoPublishingButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#373737',
    padding: 16,
  },
});

export default ToggleVideo;
