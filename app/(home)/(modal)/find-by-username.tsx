import { useRouter } from 'expo-router';
import { useState } from 'react';
import { UserResponse } from 'stream-chat';
import { useChatContext } from 'stream-chat-expo';

import Screen from '@/components/Screen';
import TextField from '@/components/TextField';
import UserCard from '@/components/UserCard';
import useContacts from '@/hooks/useContacts';

const FindByUsernameScreen = () => {
  const { client } = useChatContext();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<UserResponse | null>(null);

  const { contacts, debounceSearch } = useContacts(client);

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
      {user && <UserCard user={user} onPress={() => onSelectUser(user.id)} />}
    </Screen>
  );
};

export default FindByUsernameScreen;
