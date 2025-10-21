import { useAuth } from "@/contexts/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ProfileMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileMenu({ visible, onClose }: ProfileMenuProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          onClose();
          router.replace("/login");
        },
      },
    ]);
  };

  const menuItems = [
    {
      id: "settings",
      title: "Profile Settings",
      icon: "cog-outline",
      onPress: () => {
        onClose();
        router.push("/profile-settings");
      },
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: "bell-outline",
      onPress: () => {
        onClose();
        Alert.alert("Notifications", "Notification settings coming soon!");
      },
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      icon: "shield-lock-outline",
      onPress: () => {
        onClose();
        Alert.alert("Privacy", "Privacy settings coming soon!");
      },
    },
    {
      id: "help",
      title: "Help & Support",
      icon: "help-circle-outline",
      onPress: () => {
        onClose();
        Alert.alert("Help", "Help & Support coming soon!");
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <TouchableOpacity style={styles.menuContainer} activeOpacity={1}>
          {/* User Info Header */}
          <View style={styles.userHeader}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => {
                onClose();
                router.push("/profile-settings");
              }}
            >
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <MaterialCommunityIcons
                  name="account-circle"
                  size={60}
                  color="#6D5FFD"
                />
              )}
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.fullName || "User"}</Text>
              <Text style={styles.userRole}>{user?.role || "Member"}</Text>
              <View style={styles.usernameBadge}>
                <Text style={styles.usernameText}>
                  @{user?.username || "user"}
                </Text>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={24}
                  color="#000000"
                />
                <Text style={styles.menuItemText}>{item.title}</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#9E9E9E"
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialCommunityIcons name="logout" size={20} color="#F44336" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>PingMe v1.0.0</Text>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: "#6D5FFD",
    fontWeight: "600",
    marginBottom: 8,
  },
  usernameBadge: {
    backgroundColor: "#F3F0FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  usernameText: {
    fontSize: 12,
    color: "#6D5FFD",
    fontWeight: "500",
  },
  menuItems: {
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEBEE",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#F44336",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F44336",
  },
  footer: {
    alignItems: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: "#9E9E9E",
  },
});
