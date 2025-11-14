import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import Button from '@/components/Button';

const ModalLayout = () => {
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerBackground: () => null,
        headerTintColor: 'black',
        headerBackButtonDisplayMode: 'minimal',
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerLeft: () => (
            <Button
              variant="plain"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Feather name="chevron-left" size={32} />
            </Button>
          ),
        }}
      />
      <Stack.Screen
        name="new-message"
        options={{
          title: 'New Message',
          headerLeft: () => (
            <Button variant="text" onPress={() => router.back()}>
              Cancel
            </Button>
          ),
        }}
      />
      <Stack.Screen
        name="new-group"
        options={{
          title: 'Select Members',
        }}
      />
      <Stack.Screen
        name="find-by-username"
        options={{
          title: 'Find by Username',
        }}
      />
    </Stack>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginRight: 16,
  },
});

export default ModalLayout;
