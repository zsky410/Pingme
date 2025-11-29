import { useUser } from "@clerk/clerk-expo";
import {
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import {
  Chat,
  DeepPartial as ChatDeepPartial,
  Theme as ChatTheme,
  OverlayProvider,
} from "stream-chat-expo";

import ScreenLoading from "@/components/ScreenLoading";

const tokenProvider = async (userId: string) => {
  const response = await fetch("/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });
  const data = await response.json();
  return data.token;
};

const chatTheme: ChatDeepPartial<ChatTheme> = {
  colors: {
    white_snow: "white",
  },
  channelPreview: {
    container: {
      borderBottomWidth: 0,
      paddingLeft: 0,
    },
    title: {
      fontWeight: "500",
    },
    unreadContainer: {
      backgroundColor: "#2c6bed",
    },
  },
  messageList: {
    contentContainer: {
      justifyContent: "flex-end",
      flexGrow: 1,
    },
  },
  inlineDateSeparator: {
    container: {
      backgroundColor: "transparent",
    },
    text: {
      color: "#6B7280",
      fontSize: 12,
      fontWeight: "600",
    },
  },
  messageSimple: {
    content: {
      receiverMessageBackgroundColor: "#e9e9e9",
      textContainer: {
        paddingHorizontal: 10,
      },
      container: {
        paddingVertical: 0,
        paddingHorizontal: 0,
      },
    },
  },
  messageInput: {
    container: {
      borderTopWidth: 0,
      paddingHorizontal: 0,
      paddingBottom: 0,
      paddingTop: 0,
      backgroundColor: "transparent",
      marginBottom: 0,
    },
    inputBoxContainer: {
      backgroundColor: "#eeeeef",
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderColor: "#eeeeef",
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 8,
      minHeight: 40,
    },
    audioRecordingButton: {
      micIcon: {
        fill: "black",
        width: 24,
        height: 24,
        style: {
          marginHorizontal: 2,
        },
      },
    },
  },
};

const API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY as string;

const HomeLayout = () => {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [loading, setLoading] = useState(true);
  const [chatClient, setChatClient] = useState<StreamChat>();
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();

  useEffect(() => {
    if (!isSignedIn) {
      router.replace("/sign-in");
    }

    const customProvider = async () => {
      const token = await tokenProvider(user!.id);
      return token;
    };

    const setUpStream = async () => {
      try {
        const chatClient = StreamChat.getInstance(API_KEY);
        const clerkUser = user!;
        const chatUser = {
          id: clerkUser.id,
          name: clerkUser.fullName!,
          image: clerkUser.hasImage ? clerkUser.imageUrl : undefined,
          username: clerkUser.username!,
        };

        if (!chatClient.user) {
          await chatClient.connectUser(chatUser, customProvider);
          console.log("Stream Chat user connected:", chatClient.userID);
        }

        // Đảm bảo user được upsert vào Stream với đầy đủ thông tin
        // Điều này quan trọng để user có thể được tìm thấy bởi các user khác
        await chatClient.upsertUser({
          id: clerkUser.id,
          name: clerkUser.fullName!,
          username: clerkUser.username!,
          image: clerkUser.hasImage ? clerkUser.imageUrl : undefined,
        });
        console.log("User upserted to Stream:", {
          id: clerkUser.id,
          username: clerkUser.username,
          name: clerkUser.fullName,
        });

        setChatClient(chatClient);
        const videoClient = StreamVideoClient.getOrCreateInstance({
          apiKey: API_KEY,
          user: chatUser,
          tokenProvider: customProvider,
        });
        setVideoClient(videoClient);
      } catch (error) {
        console.error("Error setting up Stream:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) setUpStream();

    return () => {
      if (!isSignedIn) {
        chatClient?.disconnectUser();
        videoClient?.disconnectUser();
      }
    };
  }, [user, videoClient, chatClient, isSignedIn, router]);

  if (loading) return <ScreenLoading />;

  return (
    <OverlayProvider>
      <Chat client={chatClient!} style={chatTheme}>
        <StreamVideo client={videoClient!}>
          <Stack>
            <Stack.Screen
              name="(modal)"
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="chat/[id]"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="chat/[id]/thread/[messageId]"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="call/[id]"
              options={{
                headerShown: false,
                animation: "none",
              }}
            />
          </Stack>
        </StreamVideo>
      </Chat>
    </OverlayProvider>
  );
};

export default HomeLayout;
