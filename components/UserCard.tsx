import { StyleSheet, Text, View } from 'react-native';
import { UserResponse } from 'stream-chat';

import Avatar from './Avatar';
import Button from './Button';

interface UserCardProps {
  onPress?: () => void;
  user: UserResponse;
  children?: React.ReactNode;
}

const UserCard = ({ children, onPress, user }: UserCardProps) => {
  // @ts-expect-error - names
  const name = user.name || `${user.first_name} ${user.last_name}`;

  return (
    <Button
      variant="plain"
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.avatarContainer}>
        <Avatar name={name} imageUrl={user?.image} size={40} />
      </View>
      <View>
        <Text style={styles.name}>{name}</Text>
      </View>
      {children}
    </Button>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  avatarContainer: {
    height: 40,
    width: 40,
  },
  name: {
    fontSize: 16,
    lineHeight: 20,
  },
});

export default UserCard;
