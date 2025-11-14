import { useClerk, useUser } from '@clerk/clerk-expo';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { getError } from '../lib/utils';
import Avatar from './Avatar';
import Button from './Button';

const AppMenu = () => {
  const { signOut } = useClerk();
  const router = useRouter();
  const { user } = useUser();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const avatarRef = useRef<View>(null);

  const toggleMenu = () => {
    if (menuVisible) {
      setMenuVisible(false);
      return;
    }
    if (avatarRef.current) {
      avatarRef.current.measure((_x, _y, _width, height, pageX, pageY) => {
        setMenuPosition({ top: pageY + height + 8, left: pageX - 8 });
        setMenuVisible(true);
      });
    }
  };

  const goToProfile = () => {
    setMenuVisible(false);
    router.push('/profile');
  };

  const handleSignOut = async () => {
    setMenuVisible(false);
    try {
      await signOut();
      router.replace('/');
    } catch (err) {
      getError(err);
    }
  };

  return (
    <>
      <Button variant="plain" ref={avatarRef} onPress={toggleMenu}>
        <Avatar
          imageUrl={user?.imageUrl}
          size={28}
          fontSize={12}
          name={user?.fullName!}
        />
      </Button>
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={[
              styles.menuContainer,
              { top: menuPosition.top, left: menuPosition.left },
            ]}
          >
            <Button
              variant="plain"
              style={styles.menuItem}
              onPress={goToProfile}
            >
              <View style={styles.menuItemContent}>
                <Text>Profile</Text>
                <Feather name="user" size={20} color="black" />
              </View>
            </Button>
            <Button
              variant="plain"
              style={styles.menuItemLast}
              onPress={handleSignOut}
            >
              <View style={styles.menuItemContent}>
                <Text style={styles.signOutText}>Sign Out</Text>
                <Feather name="log-out" size={20} color="red" />
              </View>
            </Button>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 250,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuItemLast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  signOutText: {
    color: '#DC2626',
  },
});

export default AppMenu;
