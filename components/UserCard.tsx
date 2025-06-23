import { Text, View } from 'react-native';
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
      className="bg-white flex-row items-center gap-2 py-3 px-4 rounded-xl"
    >
      <View className="h-10 w-10">
        <Avatar name={name} imageUrl={user?.image} size={40} />
      </View>
      <View>
        <Text className="text-base leading-5">{name}</Text>
      </View>
      {children}
    </Button>
  );
};

export default UserCard;
