import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  username: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database (trong production sẽ call API)
const MOCK_USERS = [
  {
    username: "admin",
    password: "123",
    fullName: "Administrator",
    role: "Admin",
  },
  {
    username: "john",
    password: "john123",
    fullName: "John Doe",
    role: "User",
  },
  {
    username: "sarah",
    password: "sarah123",
    fullName: "Sarah Wilson",
    role: "User",
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem("@user_data");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      console.log("Login attempt:", { username, password });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find user in mock database
      const foundUser = MOCK_USERS.find(
        (u) => u.username === username && u.password === password
      );

      console.log("Found user:", foundUser);

      if (foundUser) {
        const userData: User = {
          username: foundUser.username,
          fullName: foundUser.fullName,
          role: foundUser.role,
        };

        // Save to AsyncStorage
        await AsyncStorage.setItem("@user_data", JSON.stringify(userData));
        setUser(userData);
        console.log("Login successful:", userData);
        return true;
      }

      console.log("Login failed: user not found");
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("@user_data");
      setUser(null);
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
