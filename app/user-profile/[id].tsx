import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

// Mock user data
const MOCK_USERS: Record<
  string,
  {
    id: string;
    name: string;
    username: string;
    avatar: string;
    bio: string;
    status: string;
    phone: string;
    email: string;
    joinedDate: string;
    mutualGroups: number;
  }
> = {
  john: {
    id: "7",
    name: "John Doe",
    username: "john",
    avatar: "https://i.pravatar.cc/150?img=7",
    bio: "Software Developer | Tech Enthusiast | Coffee Lover ☕",
    status: "Online",
    phone: "+1 234 567 8900",
    email: "john.doe@example.com",
    joinedDate: "January 2024",
    mutualGroups: 5,
  },
  alex: {
    id: "1",
    name: "Alex Mason",
    username: "alex",
    avatar: "https://i.pravatar.cc/150?img=1",
    bio: "Designer | Creative Mind | Always Learning 🎨",
    status: "Online",
    phone: "+1 234 567 8901",
    email: "alex.mason@example.com",
    joinedDate: "February 2024",
    mutualGroups: 3,
  },
  andrew: {
    id: "2",
    name: "Andrew Joseph",
    username: "andrew",
    avatar: "https://i.pravatar.cc/150?img=2",
    bio: "Product Manager | Startup Enthusiast 🚀",
    status: "Away",
    phone: "+1 234 567 8902",
    email: "andrew.joseph@example.com",
    joinedDate: "March 2024",
    mutualGroups: 4,
  },
  avery: {
    id: "3",
    name: "Avery Quinn",
    username: "avery",
    avatar: "https://i.pravatar.cc/150?img=3",
    bio: "Marketing Specialist | Content Creator 📱",
    status: "Online",
    phone: "+1 234 567 8903",
    email: "avery.quinn@example.com",
    joinedDate: "January 2024",
    mutualGroups: 2,
  },
  brian: {
    id: "4",
    name: "Brian Michael",
    username: "brian",
    avatar: "https://i.pravatar.cc/150?img=4",
    bio: "Full Stack Developer | Open Source Contributor 💻",
    status: "Offline",
    phone: "+1 234 567 8904",
    email: "brian.michael@example.com",
    joinedDate: "April 2024",
    mutualGroups: 6,
  },
  cameron: {
    id: "5",
    name: "Cameron Lee",
    username: "cameron",
    avatar: "https://i.pravatar.cc/150?img=5",
    bio: "Data Scientist | AI Enthusiast | Runner 🏃",
    status: "Online",
    phone: "+1 234 567 8905",
    email: "cameron.lee@example.com",
    joinedDate: "February 2024",
    mutualGroups: 7,
  },
  charles: {
    id: "6",
    name: "Charles Dean",
    username: "charles",
    avatar: "https://i.pravatar.cc/150?img=6",
    bio: "UX Researcher | Psychology Nerd 🧠",
    status: "Away",
    phone: "+1 234 567 8906",
    email: "charles.dean@example.com",
    joinedDate: "March 2024",
    mutualGroups: 4,
  },
};

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const user = MOCK_USERS[id as string];

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#000000"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor =
    user.status === "Online"
      ? "#4CAF50"
      : user.status === "Away"
      ? "#FF9800"
      : "#9E9E9E";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color="#000000"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View
              style={[styles.statusIndicator, { backgroundColor: statusColor }]}
            />
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.status}>{user.status}</Text>

          {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton}>
              <MaterialCommunityIcons
                name="message-text"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.primaryButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <MaterialCommunityIcons name="phone" size={20} color="#6D5FFD" />
              <Text style={styles.secondaryButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <MaterialCommunityIcons name="video" size={20} color="#6D5FFD" />
              <Text style={styles.secondaryButtonText}>Video</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="phone" size={20} color="#6D5FFD" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="email" size={20} color="#6D5FFD" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color="#6D5FFD"
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Joined</Text>
              <Text style={styles.infoValue}>{user.joinedDate}</Text>
            </View>
          </View>
        </View>

        {/* Groups Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mutual Groups</Text>
          <TouchableOpacity style={styles.groupsCard}>
            <MaterialCommunityIcons
              name="account-group"
              size={24}
              color="#6D5FFD"
            />
            <Text style={styles.groupsText}>
              {user.mutualGroups} groups in common
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#9E9E9E"
            />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerButton}>
            <MaterialCommunityIcons
              name="block-helper"
              size={20}
              color="#F44336"
            />
            <Text style={styles.dangerButtonText}>Block User</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerButton}>
            <MaterialCommunityIcons name="flag" size={20} color="#F44336" />
            <Text style={styles.dangerButtonText}>Report User</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  moreButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 8,
    borderBottomColor: "#F8F8F8",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0F0F0",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
    marginBottom: 16,
  },
  bio: {
    fontSize: 15,
    color: "#424242",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6D5FFD",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0EDFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6D5FFD",
  },
  section: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 8,
    borderBottomColor: "#F8F8F8",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#757575",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000000",
  },
  groupsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  groupsText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#000000",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#F44336",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#757575",
  },
});
