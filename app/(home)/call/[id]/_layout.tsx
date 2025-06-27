import {
  Call,
  MemberRequest,
  StreamCall,
  useStreamVideoClient,
} from '@stream-io/video-react-native-sdk';
import { Stack, useGlobalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useChatContext } from 'stream-chat-expo';

import ScreenLoading from '@/components/ScreenLoading';
import { checkIfDMChannel } from '@/lib/utils';

const CallLayout = () => {
  const { id, updateCall, video } = useGlobalSearchParams();
  const router = useRouter();
  const [call, setCall] = useState<Call>();
  const videoClient = useStreamVideoClient();
  const { client: chatClient } = useChatContext();

  useEffect(() => {
    const startCall = async () => {
      const channel = chatClient.channel('messaging', id);
      await channel.watch();
      const _call = videoClient?.call('default', id as string);
      const isDMChannel = checkIfDMChannel(channel);
      const members = Object.values(channel?.state.members!).map<MemberRequest>(
        (member) => ({
          user_id: member.user?.id as string,
          name: member.user?.name as string,
          role: isDMChannel ? 'admin' : undefined,
        })
      );
      const callConfig = {
        custom: {
          triggeredBy: chatClient.user?.id,
          members,
        },
        settings_override: {
          video: {
            enabled: true,
            camera_default_on: video === 'true',
            target_resolution: {
              width: 2560,
              height: 1440,
            },
          },
        },
      };

      await _call?.getOrCreate({
        ring: true,
        data: {
          members,
          ...callConfig,
        },
      });

      if (updateCall === 'true') {
        await _call?.update(callConfig);
      }

      if (!isDMChannel && updateCall === 'true') {
        try {
          await _call?.join({ maxJoinRetries: 3 });
        } catch {
          router.back();
        }
      }

      setCall(_call);
    };

    startCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!call) {
    return <ScreenLoading />;
  }

  return (
    <StreamCall call={call}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </StreamCall>
  );
};

export default CallLayout;
