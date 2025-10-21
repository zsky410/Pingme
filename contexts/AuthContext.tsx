import {
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";

interface User {
  uid: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  avatar?: string;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUser({
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
              });
            } else {
              // If user document doesn't exist, create it
              const newUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                username: firebaseUser.displayName?.split(" ")[0] || "",
                fullName: firebaseUser.displayName || "",
                role: "User",
                avatar: firebaseUser.photoURL || "",
              };
              await setDoc(doc(db, "users", firebaseUser.uid), newUser);
              setUser(newUser);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        } else {
          setUser(null);
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
          setUser({
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
          });
          console.log("User data reloaded successfully");
        }
      }
    } catch (error) {
      console.error("Error reloading user:", error);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
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
