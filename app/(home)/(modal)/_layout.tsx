import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

import Button from '@/components/Button';

const NewMessageLayout = () => {
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerTintColor: 'black',
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerLeft: () => (
            <Button
              variant="plain"
              onPress={() => router.dismissAll()}
              className="right-4"
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
            <Button variant="text" onPress={() => router.dismissAll()}>
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

export default NewMessageLayout;
