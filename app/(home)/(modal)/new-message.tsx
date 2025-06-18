import { Link } from 'expo-router';
import { View } from 'react-native';

import Button from '@/components/Button';
import Screen from '@/components/Screen';

const NewMessageScreen = () => {
  return (
    <Screen className="bg-white" viewClassName="px-4 pt-1">
      <View className="flex flex-col gap-4">
        <View>
          <Link href="/new-group" asChild>
            <Button className="w-full">New Group</Button>
          </Link>
        </View>
        <View>
          <Link href="/find-by-username" asChild>
            <Button className="w-full">Find by Username</Button>
          </Link>
        </View>
      </View>
    </Screen>
  );
};

export default NewMessageScreen;
