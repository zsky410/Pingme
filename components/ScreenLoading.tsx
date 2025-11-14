import { StyleSheet } from 'react-native';
import Screen from './Screen';
import Spinner from './Spinner';

const ScreenLoading = () => {
  return (
    <Screen
      style={styles.screen}
      viewStyle={styles.view}
    >
      <Spinner />
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: 'white',
  },
  view: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ScreenLoading;
