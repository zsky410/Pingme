import { useUser } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import AppImage from "@/components/AppImage";
import Button from "@/components/Button";
import Screen from "@/components/Screen";

const WelcomeScreen = () => {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return <Redirect href="/chats" />;
  }

  return (
    <Screen style={styles.screen} viewStyle={styles.view}>
      <AppImage
        source={require("@/assets/images/onboarding_splash_Normal.png")}
        style={styles.image}
        contentFit="cover"
      />
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Take privacy with you.</Text>
          <Text style={[styles.title, styles.titleSecond]}>
            Be yourself in every message.
          </Text>
        </View>
        <Text style={styles.terms}>Terms & Privacy Policy</Text>
      </View>
      <Button onPress={() => router.navigate("/sign-up")}>Continue</Button>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "white",
  },
  view: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 64,
  },
  image: {
    width: "85%",
    height: "55%",
  },
  content: {
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  textContainer: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 28.5,
    fontWeight: "600",
  },
  titleSecond: {
    width: 210,
  },
  terms: {
    fontSize: 16,
    color: "#6B7280",
  },
});

export default WelcomeScreen;
