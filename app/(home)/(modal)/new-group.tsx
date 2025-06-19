import Checkbox from 'expo-checkbox';
import { getRandomBytesAsync } from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { UserResponse } from 'stream-chat';
import { useChatContext } from 'stream-chat-expo';

import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import Screen from '@/components/Screen';
import Spinner from '@/components/Spinner';
import TextField from '@/components/TextField';
import useContacts from '@/hooks/useContacts';
import { getLastSeen } from '@/lib/utils';

const NewGroupScreen = () => {
  const { client } = useChatContext();
  const router = useRouter();
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [query, setQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { contacts, loadingContacts, debounceSearch } = useContacts(
    client,
    setUsers
  );

  const resetUsers = () => {
    setUsers(contacts);
  };

  const search = (query: string) => {
    const users = contacts.filter((user) => {
      // @ts-expect-error - name
      const name = user.name || `${user.first_name} ${user.last_name}`;
      return (
        user.username?.toLowerCase().includes(query.toLowerCase()) ||
        name.toLowerCase().includes(query.toLowerCase())
      );
    });
    setUsers(users);
  };

  const handleUserSearch = (text: string) => {
    setQuery(text);
    debounceSearch(text, resetUsers, search);
  };

  const leave = () => {
    setCreatingGroup(false);
    setGroupName('');
    setQuery('');
    setSelectedUsers([]);
    router.dismissTo('/chats');
  };

  const createNewGroup = async () => {
    if (!groupName) {
      alert('Please enter a group name.');
      return;
    }
    if (selectedUsers.length === 0) {
      alert('Please select at least one user.');
      return;
    }

    setCreatingGroup(true);

    try {
      const bytes = await getRandomBytesAsync(7);
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
      const id = Array.from(bytes)
        .map((b) => alphabet[b % alphabet.length])
        .join('');
      const group = client.channel('messaging', id, {
        members: [...selectedUsers, client.userID!],
        // @ts-expect-error - name
        name: groupName,
      });

      await group.create();
      leave();
    } catch (error) {
      console.error(error);
      alert('Error creating group');
    } finally {
      setCreatingGroup(false);
    }
  };

  const onSelectUser = (userId: string, value: boolean) => {
    setSelectedUsers((prevSelectedUsers) => {
      if (value) {
        return [...prevSelectedUsers, userId];
      } else {
        return prevSelectedUsers.filter((id) => id !== userId);
      }
    });
  };

  const sortedUsers = useMemo(
    () =>
      users.sort((a, b) => {
        if (selectedUsers.includes(a.id)) {
          return -1;
        } else if (selectedUsers.includes(b.id)) {
          return 1;
        } else {
          return 0;
        }
      }),
    [users, selectedUsers]
  );

  return (
    <Screen viewClassName="pt-4 px-4 gap-4">
      <TextField
        id="groupName"
        label="Group Name"
        placeholder="Group Name"
        value={groupName}
        onChangeText={(value) => setGroupName(value)}
      />
      <TextField
        id="users"
        label="Add Members"
        placeholder="Who would you like to add?"
        value={query}
        onChangeText={(value) => handleUserSearch(value)}
        autoCapitalize="none"
      />
      {loadingContacts && (
        <View className="flex items-center justify-center py-4">
          <Spinner />
        </View>
      )}
      {!loadingContacts && users.length > 0 && (
        <View className="flex flex-col gap-2 mt-2">
          {sortedUsers.map((user) => (
            <UserCheckbox
              key={user.id}
              user={user}
              checked={selectedUsers.includes(user.id)}
              onValueChange={(value) => onSelectUser(user.id, value)}
            />
          ))}
        </View>
      )}

      <Button
        className="mt-auto"
        onPress={createNewGroup}
        disabled={creatingGroup}
      >
        {!creatingGroup && 'Create group'}
        {creatingGroup && <ActivityIndicator />}
      </Button>
    </Screen>
  );
};

interface UserCheckboxProps {
  user: UserResponse;
  checked: boolean;
  onValueChange: (value: boolean) => void;
}

const UserCheckbox = ({ user, checked, onValueChange }: UserCheckboxProps) => {
  return (
    <Pressable
      onPress={() => onValueChange(!checked)}
      className="bg-white flex-row items-center gap-2 py-3 px-4 rounded-xl"
    >
      <View className="relative h-10 w-10">
        <Avatar
          // @ts-expect-error - names
          name={user.name || `${user.first_name} ${user.last_name}`}
          imageUrl={user.image}
          size={40}
        />
      </View>
      <View>
        <Text className="text-base leading-5">
          {/** @ts-expect-error - names */}
          {user.name || `${user.first_name} ${user.last_name}`}
        </Text>
        <Text className="text-sm">{getLastSeen(user.last_active!)}</Text>
      </View>
      <View className="flex items-center ml-auto">
        <Checkbox
          id={user.id}
          value={checked}
          onValueChange={onValueChange}
          className="size-4 rounded border-2 border-color-borders-input"
        />
      </View>
    </Pressable>
  );
};

export default NewGroupScreen;
