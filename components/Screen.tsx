import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  viewStyle?: ViewStyle;
  loadingOverlay?: boolean;
  edges?: Edge[];
}

const Screen = ({
  children,
  style,
  viewStyle,
  loadingOverlay = false,
  edges = ['top', 'left', 'right'],
}: ScreenProps) => {
  return (
    <>
      <SafeAreaView
        style={[styles.container, Platform.OS === 'android' && styles.androidPadding, style]}
        edges={edges}
      >
        <View style={[styles.view, viewStyle]}>{children}</View>
      </SafeAreaView>
      {loadingOverlay && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="white" />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  androidPadding: {
    paddingTop: 12,
  },
  view: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
});

export default Screen;
