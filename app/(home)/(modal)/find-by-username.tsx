import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UserResponse } from 'stream-chat';
import { useChatContext } from 'stream-chat-expo';

import Screen from '@/components/Screen';
import Spinner from '@/components/Spinner';
import TextField from '@/components/TextField';
import UserCard from '@/components/UserCard';
import useContacts from '@/hooks/useContacts';

const FindByUsernameScreen = () => {
  const { client } = useChatContext();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const { debounceSearch } = useContacts(client, undefined, false);

  const resetUser = () => {
    setUser(null);
  };

  const search = async (query: string) => {
    try {
      setLoading(true);
      setUser(null); // Reset user khi search mới

      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        setLoading(false);
        return;
      }

      console.log('Searching for user with query:', trimmedQuery);

      // Tìm exact match trước (full username với số, ví dụ: "john_41")
      let { users } = await client.queryUsers({
        username: { $eq: trimmedQuery },
      });

      console.log('Exact match results:', users.length);

      // Nếu không tìm thấy exact match, thử tìm tất cả users và filter ở client side
      // (để tìm partial match, ví dụ: "john" sẽ match "john_41")
      if (users.length === 0) {
        try {
          // Query tất cả users (có thể giới hạn số lượng)
          const { users: allUsers } = await client.queryUsers(
            {},
            { limit: 100 } // Giới hạn 100 users để tránh quá tải
          );

          // Filter ở client side: tìm username chứa query (case insensitive)
          const matchedUsers = allUsers.filter((u) => {
            const username = u.username?.toLowerCase() || '';
            const name = u.name?.toLowerCase() || '';
            const searchLower = trimmedQuery.toLowerCase();

            return (
              (username.includes(searchLower) || name.includes(searchLower)) &&
              u.id !== client.userID
            );
          });

          users = matchedUsers;
          console.log('Partial match results:', users.length);
        } catch (partialError) {
          console.error('Error in partial search:', partialError);
        }
      }

      // Lọc bỏ chính user hiện tại
      const filteredUsers = users.filter((u) => u.id !== client.userID);

      if (filteredUsers.length > 0) {
        console.log('Found user:', filteredUsers[0].username);
        setUser(filteredUsers[0]);
      } else {
        // Không tìm thấy user
        console.log('No users found for query:', trimmedQuery);
      }
    } catch (error: any) {
      console.error('Error fetching user:', error);
      // Hiển thị error message cho user
      if (error.message) {
        console.error('Error details:', error.message);
      }
    } finally {
      setLoading(false);
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
    <Screen viewStyle={styles.view}>
      <TextField
        id="username"
        placeholder="Username"
        value={username}
        onChangeText={(value) => handleUserSearch(value)}
        autoCapitalize="none"
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <Spinner />
        </View>
      )}
      {!loading && !user && username.trim().length > 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No user found</Text>
        </View>
      )}
      {!loading && user && (
        <UserCard user={user} onPress={() => onSelectUser(user.id)} />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  view: {
    paddingTop: 4,
    paddingHorizontal: 16,
    gap: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  emptyText: {
    color: '#6B7280',
  },
});

export default FindByUsernameScreen;
