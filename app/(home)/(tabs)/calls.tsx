import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import AppMenu from '@/components/AppMenu';
import Button from '@/components/Button';
import Screen from '@/components/Screen';

const CallsScreen = () => {
  return (
    <Screen style={styles.screen} viewStyle={styles.view}>
      <View style={styles.header}>
        <AppMenu />
        <View style={styles.actions}>
          <Button variant="plain">
            <Feather name="phone" size={20} color="black" />
          </Button>
        </View>
      </View>
      <Button variant="plain" style={styles.callLinkButton}>
        <Feather name="link" size={20} color="black" />
        <Text style={styles.callLinkText}>Create a Call Link</Text>
      </Button>
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No recent calls</Text>
        <Text style={styles.emptySubtitle}>
          Get started by calling a friend
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: 'white',
  },
  view: {
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 40,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  callLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  callLinkText: {
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  emptyTitle: {
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#4B5563',
  },
});

export default CallsScreen;
