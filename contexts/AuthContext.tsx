import {
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../config/firebase";

interface User {
  uid: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AsyncStorage keys
const USER_STORAGE_KEY = "@pingme_user";
const AUTH_STATE_KEY = "@pingme_auth_state";

// Helper functions for AsyncStorage
const saveUserToStorage = async (user: User) => {
  try {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(AUTH_STATE_KEY, "true");
  } catch (error) {
    console.error("Error saving user to storage:", error);
  }
};

const removeUserFromStorage = async () => {
  try {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    await AsyncStorage.removeItem(AUTH_STATE_KEY);
  } catch (error) {
    console.error("Error removing user from storage:", error);
  }
};

const getUserFromStorage = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting user from storage:", error);
    return null;
  }
};

const getAuthStateFromStorage = async (): Promise<boolean> => {
  try {
    const authState = await AsyncStorage.getItem(AUTH_STATE_KEY);
    return authState === "true";
  } catch (error) {
    console.error("Error getting auth state from storage:", error);
    return false;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, try to get user from AsyncStorage for immediate UI update
        const storedUser = await getUserFromStorage();
        const storedAuthState = await getAuthStateFromStorage();

        if (storedUser && storedAuthState) {
          console.log("Found stored user, setting user immediately");
          setUser(storedUser);
        }
      } catch (error) {
        console.error("Error initializing auth from storage:", error);
      }
    };

    initializeAuth();
  }, []);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        console.log(
          "Firebase auth state changed:",
          firebaseUser ? "logged in" : "logged out"
        );

        if (firebaseUser) {
          try {
            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              // Update user online status
              await updateDoc(doc(db, "users", firebaseUser.uid), {
                isOnline: true,
                lastSeen: new Date().toISOString(),
              });

              const userObject: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                username: userData.username,
                fullName: userData.fullName,
                role: userData.role || "User",
                avatar: userData.avatar
                  ? `data:${userData.avatarType || "image/jpeg"};base64,${
                      userData.avatar
                    }`
                  : "",
                isOnline: true,
                lastSeen: new Date().toISOString(),
              };

              setUser(userObject);
              // Save to AsyncStorage for persistence
              await saveUserToStorage(userObject);
              console.log("User logged in and saved to storage");
            } else {
              // If user document doesn't exist, create it
              const newUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                username: firebaseUser.displayName?.split(" ")[0] || "",
                fullName: firebaseUser.displayName || "",
                role: "User",
                avatar: firebaseUser.photoURL || "",
                isOnline: true,
                lastSeen: new Date().toISOString(),
              };
              await setDoc(doc(db, "users", firebaseUser.uid), newUser);
              setUser(newUser);
              // Save to AsyncStorage for persistence
              await saveUserToStorage(newUser);
              console.log("New user created and saved to storage");
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        } else {
          // User logged out
          setUser(null);
          await removeUserFromStorage();
          console.log("User logged out and removed from storage");
        }
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      // Handle specific Firebase auth errors
      let errorMessage = "Login failed. Please try again.";

      switch (error.code) {
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password.";
          break;
        case "auth/user-not-found":
          errorMessage = "No account found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email format.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many login attempts. Please try again later.";
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Network error. Please check your internet connection.";
          break;
        default:
          errorMessage = "An error occurred. Please try again.";
      }

      // Log error for debugging but don't throw it
      console.log("Login failed:", error.code, errorMessage);

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const reloadUser = async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        // Get fresh user data from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userObject: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            username: userData.username,
            fullName: userData.fullName,
            role: userData.role || "User",
            avatar: userData.avatar
              ? `data:${userData.avatarType || "image/jpeg"};base64,${
                  userData.avatar
                }`
              : "",
            isOnline: userData.isOnline || false,
            lastSeen: userData.lastSeen || "",
          };
          setUser(userObject);
          // Update AsyncStorage with fresh data
          await saveUserToStorage(userObject);
          console.log("User data reloaded and saved to storage successfully");
        }
      }
    } catch (error) {
      console.error("Error reloading user:", error);
    }
  };

  const logout = async () => {
    try {
      // Set user offline before signing out
      if (user?.uid) {
        await updateDoc(doc(db, "users", user.uid), {
          isOnline: false,
          lastSeen: new Date().toISOString(),
        });
      }

      // Remove user data from AsyncStorage
      await removeUserFromStorage();

      // Sign out from Firebase
      await firebaseSignOut(auth);

      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        reloadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
