import { Redirect } from "expo-router";

export default function Index() {
  // Redirect to tabs/chats
  return <Redirect href="/(tabs)/chats" />;
}
