import Checkbox from 'expo-checkbox';
import { StyleSheet, View } from 'react-native';
import { UserResponse } from 'stream-chat';

import UserCard from './UserCard';

interface UserCheckboxProps {
  user: UserResponse;
  checked: boolean;
  onValueChange: (value: boolean) => void;
}

const UserCheckbox = ({ user, checked, onValueChange }: UserCheckboxProps) => {
  return (
    <UserCard onPress={() => onValueChange(!checked)} user={user}>
      <View style={styles.checkboxContainer}>
        <Checkbox
          id={user.id}
          value={checked}
          onValueChange={onValueChange}
          style={styles.checkbox}
        />
      </View>
    </UserCard>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
});

export default UserCheckbox;
