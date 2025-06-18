import Checkbox from 'expo-checkbox';
import { getRandomBytesAsync } from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { UserResponse } from 'stream-chat';
import { useChatContext } from 'stream-chat-expo';

import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import Screen from '@/components/Screen';
import TextField from '@/components/TextField';
import { getLastSeen } from '@/lib/utils';

const NewGroupScreen = () => {
  const { client } = useChatContext();
  const router = useRouter();
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [query, setQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [originalUsers, setOriginalUsers] = useState<UserResponse[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    const getAllUsers = async () => {
      const userId = client.userID;

      const { users } = await client.queryUsers(
        // @ts-expect-error - id
        { id: { $ne: userId } },
        { id: 1, name: 1 },
        { limit: 20 }
      );

      setUsers(users);
      setOriginalUsers(users);
    };
    getAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserSearch = async (text: string) => {
    const query = text.trimStart();
    setQuery(query);

    if (!query) {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      cancelled.current = true;
      setUsers(originalUsers);
      return;
    }

    cancelled.current = false;

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      if (cancelled.current) return;

      try {
        const userId = client.userID;
        const { users } = await client.queryUsers(
          {
            $or: [
              { id: { $autocomplete: query } },
              { name: { $autocomplete: query } },
            ],
            // @ts-expect-error - id
            id: { $ne: userId },
          },
          { id: 1, name: 1 },
          { limit: 5 }
        );

        if (!cancelled.current) setUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }, 200);
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
      console.log('Group created successfully:', group);
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
    <Screen className="bg-white" viewClassName="pt-4 px-4 gap-4">
      <Text className="mx-1 font-medium text-[1rem] text-color-text-secondary">
        Group name
      </Text>
      <TextField
        id="groupName"
        value={groupName}
        onChangeText={(value) => setGroupName(value)}
        placeholder="Group name"
      />
      <Text className="mx-1 font-medium text-[1rem] text-color-text-secondary">
        Add members
      </Text>
      <TextField
        id="users"
        placeholder="Who would you like to add?"
        value={query}
        onChangeText={(value) => handleUserSearch(value)}
      />
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
    <View className="flex-row items-center gap-2 p-2 h-[3.5rem] rounded-xl">
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
    </View>
  );
};

export default NewGroupScreen;
