import { Entypo, Feather, MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useChatContext } from 'stream-chat-expo';

import Button from '@/components/Button';
import Screen from '@/components/Screen';
import Spinner from '@/components/Spinner';
import UserCard from '@/components/UserCard';
import useContacts from '@/hooks/useContacts';

const NewMessageScreen = () => {
  const router = useRouter();
  const { client } = useChatContext();
  const { contacts, loadingContacts } = useContacts(client);

  const onSelectUser = async (userId: string) => {
    const channel = client.getChannelByMembers('messaging', {
      members: [client.userID!, userId],
    });
    router.dismissTo({
      pathname: '/chat/[id]',
      params: { id: channel.id! },
    });
  };

  return (
    <Screen viewStyle={styles.view}>
      <View style={styles.optionsContainer}>
        <Link href="/new-group" asChild>
          <Button variant="plain" style={styles.optionButtonTop}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="people-outline" size={24} color="black" />
            </View>
            <View style={styles.optionContent}>
              <Text>New Group</Text>
              <View style={styles.chevronContainer}>
                <Entypo name="chevron-small-right" size={24} color="gray" />
              </View>
            </View>
          </Button>
        </Link>
        <Link href="/find-by-username" asChild>
          <Button variant="plain" style={styles.optionButtonBottom}>
            <View style={styles.iconContainer}>
              <Feather name="at-sign" size={24} color="black" />
            </View>
            <View style={styles.optionContent}>
              <Text>Find by Username</Text>
              <View style={styles.chevronContainer}>
                <Entypo name="chevron-small-right" size={24} color="gray" />
              </View>
            </View>
          </Button>
        </Link>
      </View>
      {loadingContacts && (
        <View style={styles.loadingContainer}>
          <Spinner />
        </View>
      )}
      {!loadingContacts && contacts.length > 0 && (
        <View style={styles.contactsContainer}>
          {contacts.map((contact) => (
            <UserCard
              key={contact.id}
              user={contact}
              onPress={() => onSelectUser(contact.id)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  view: {
    paddingTop: 4,
    paddingHorizontal: 16,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButtonTop: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingTop: 2,
  },
  optionButtonBottom: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingBottom: 2,
  },
  iconContainer: {
    paddingHorizontal: 16,
  },
  optionContent: {
    flexDirection: 'row',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },
  chevronContainer: {
    padding: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  contactsContainer: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 16,
  },
});

export default NewMessageScreen;
