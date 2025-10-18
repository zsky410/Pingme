import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import { useAuth } from "@/contexts/AuthContext";

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const opacity = useSharedValue(0);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    // Always start animation immediately when component mounts
    if (!animationStarted) {
      setAnimationStarted(true);
      opacity.value = withTiming(1, { duration: 500 }); // Fade in immediately
    }
  }, [animationStarted]);

  useEffect(() => {
    // Ensure splash shows for at least 2 seconds
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Wait for both auth check AND minimum time to complete
    if (!isLoading && minTimeElapsed) {
      // Fade out -> navigate
      opacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(navigateToNextScreen)();
        }
      });
    }
  }, [isLoading, minTimeElapsed]);

  const navigateToNextScreen = () => {
    if (isAuthenticated) {
      // User is logged in, go to chats
      router.replace("/(tabs)/chats");
    } else {
      // User not logged in, go to login
      router.replace("/login");
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Image
          source={require("@/assets/logo/logo_full.png")}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 300,
    height: 150,
  },
});
