import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { UserResponse } from 'stream-chat';
import { useChatContext } from 'stream-chat-expo';

import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import Screen from '@/components/Screen';
import Spinner from '@/components/Spinner';
import TextField from '@/components/TextField';
import useContacts from '@/hooks/useContacts';

const FindByUsernameScreen = () => {
  const { client } = useChatContext();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<UserResponse | null>(null);

  const { contacts, loadingContacts, debounceSearch } = useContacts(client);

  const resetUser = () => {
    setUser(null);
  };

  const search = (query: string) => {
    const users = contacts.filter((user) => {
      return user.username?.toLowerCase() === query.toLowerCase();
    });

    if (users.length > 0) {
      setUser(users[0]);
    } else {
      setUser(null);
    }
  };

  const handleUserSearch = async (text: string) => {
    setUsername(text);
    debounceSearch(text, resetUser, search);
  };

  const onSelectUser = async (userId: string) => {
    const channel = client.getChannelByMembers('messaging', {
      members: [client.userID!, userId],
    });
    console.log('Channel:', channel.id);

    if (channel.id) {
      router.dismissTo({
        pathname: '/chat/[id]',
        params: { id: channel.id },
      });
    } else {
      await channel.create();
      router.dismissTo({
        pathname: '/chat/[id]',
        params: { id: channel.data?.id! },
      });
    }
  };

  return (
    <Screen viewClassName="pt-4 px-4 gap-4">
      <TextField
        id="username"
        placeholder="Username"
        value={username}
        onChangeText={(value) => handleUserSearch(value)}
        autoCapitalize="none"
      />
      {loadingContacts && (
        <View className="flex items-center justify-center py-4">
          <Spinner />
        </View>
      )}
      {!loadingContacts && user && (
        <Button
          variant="plain"
          onPress={() => onSelectUser(user.id)}
          className="flex-row items-center gap-2 py-3 px-4 rounded-xl bg-white"
        >
          <View className="h-10 w-10">
            <Avatar
              // @ts-expect-error - names
              name={user.name || `${user.first_name} ${user.last_name}`}
              imageUrl={user?.image}
              size={40}
            />
          </View>
          <View>
            <Text className="text-base leading-5">
              {/** @ts-expect-error - names */}
              {user.name || `${user.first_name} ${user.last_name}`}
            </Text>
          </View>
        </Button>
      )}
    </Screen>
  );
};

export default FindByUsernameScreen;
