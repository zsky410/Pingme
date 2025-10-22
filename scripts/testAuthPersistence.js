// Test script to verify auth persistence
// This script can be run to test if the auth persistence is working correctly

const AsyncStorage = require('@react-native-async-storage/async-storage');

const USER_STORAGE_KEY = "@pingme_user";
const AUTH_STATE_KEY = "@pingme_auth_state";

async function testAuthPersistence() {
  console.log("Testing Auth Persistence...");

  try {
    // Test saving user data
    const testUser = {
      uid: "test123",
      email: "test@example.com",
      username: "testuser",
      fullName: "Test User",
      role: "User",
      avatar: "",
      isOnline: true,
      lastSeen: new Date().toISOString(),
    };

    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(testUser));
    await AsyncStorage.setItem(AUTH_STATE_KEY, "true");
    console.log("✅ User data saved to storage");

    // Test retrieving user data
    const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
    const storedAuthState = await AsyncStorage.getItem(AUTH_STATE_KEY);

    if (storedUser && storedAuthState === "true") {
      console.log("✅ User data retrieved from storage");
      console.log("User:", JSON.parse(storedUser));
    } else {
      console.log("❌ Failed to retrieve user data");
    }

    // Test removing user data
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    await AsyncStorage.removeItem(AUTH_STATE_KEY);
    console.log("✅ User data removed from storage");

    // Verify removal
    const removedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
    const removedAuthState = await AsyncStorage.getItem(AUTH_STATE_KEY);

    if (!removedUser && !removedAuthState) {
      console.log("✅ User data successfully removed");
    } else {
      console.log("❌ Failed to remove user data");
    }

    console.log("🎉 Auth persistence test completed successfully!");

  } catch (error) {
    console.error("❌ Auth persistence test failed:", error);
  }
}

// Run the test
testAuthPersistence();
