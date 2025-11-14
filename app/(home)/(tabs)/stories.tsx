import { useUser } from '@clerk/clerk-expo';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import Screen from '@/components/Screen';

const StoriesScreen = () => {
  const { user } = useUser();

  return (
    <Screen style={styles.screen} viewStyle={styles.view}>
      <View style={styles.header}>
        <View style={styles.actions}>
          <Button variant="plain">
            <Feather name="camera" size={20} color="black" />
          </Button>
        </View>
      </View>
      <Button variant="plain" style={styles.storyButton}>
        <View style={styles.avatarContainer}>
          <Avatar
            imageUrl={user?.imageUrl}
            size={40}
            fontSize={16}
            name={user?.fullName!}
          />
          <View style={styles.addIcon}>
            <Feather name="plus" size={14} color="white" />
          </View>
        </View>
        <View>
          <Text style={styles.storyTitle}>My Stories</Text>
          <Text style={styles.storySubtitle}>Tap to add</Text>
        </View>
      </Button>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: 'white',
  },
  view: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    height: 32,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  storyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  avatarContainer: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  addIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyTitle: {
    fontWeight: '600',
  },
  storySubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default StoriesScreen;
