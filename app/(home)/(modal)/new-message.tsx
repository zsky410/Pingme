import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import Button from '@/components/Button';
import Screen from '@/components/Screen';
import { Entypo, Feather, MaterialIcons } from '@expo/vector-icons';

const NewMessageScreen = () => {
  return (
    <Screen viewClassName="px-4 pt-1">
      <View className="w-full">
        <Link href="/new-group" asChild>
          <Button
            variant="plain"
            className="bg-white flex-row items-center justify-between rounded-t-lg pt-0.5"
          >
            <View className="px-4">
              <MaterialIcons name="people-outline" size={24} color="black" />
            </View>
            <View className="flex-row flex-grow items-center justify-between gap-2 border-b border-gray-200">
              <Text>New Group</Text>
              <View className="p-2">
                <Entypo name="chevron-small-right" size={24} color="gray" />
              </View>
            </View>
          </Button>
        </Link>
        <Link href="/find-by-username" asChild>
          <Button
            variant="plain"
            className="bg-white flex-row items-center justify-between rounded-b-lg pb-0.5"
          >
            <View className="px-4">
              <Feather name="at-sign" size={24} color="black" />
            </View>
            <View className="flex-row flex-grow items-center justify-between gap-2">
              <Text>Find by Username</Text>
              <View className="p-2">
                <Entypo name="chevron-small-right" size={24} color="gray" />
              </View>
            </View>
          </Button>
        </Link>
      </View>
    </Screen>
  );
};

export default NewMessageScreen;
