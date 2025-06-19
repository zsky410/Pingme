import Checkbox from 'expo-checkbox';
import { View } from 'react-native';
import { UserResponse } from 'stream-chat';

import UserCard from './UserCard';

interface UserProps {
  user: UserResponse;
  checked: boolean;
  onValueChange: (value: boolean) => void;
}

const User = ({ user, checked, onValueChange }: UserProps) => {
  return (
    <UserCard onPress={() => onValueChange(!checked)} user={user}>
      <View className="flex items-center ml-auto">
        <Checkbox
          id={user.id}
          value={checked}
          onValueChange={onValueChange}
          className="size-4 rounded border-2 border-color-borders-input"
        />
      </View>
    </UserCard>
  );
};

export default User;
