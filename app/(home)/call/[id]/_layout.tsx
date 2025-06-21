import {
  Call,
  MemberRequest,
  StreamCall,
  useStreamVideoClient,
} from '@stream-io/video-react-native-sdk';
import { Stack, useGlobalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useChatContext } from 'stream-chat-expo';

import ScreenLoading from '../../../../components/ScreenLoading';
import { checkIfDMChannel } from '../../../../lib/utils';

const CallLayout = () => {
  const { id, updateCall } = useGlobalSearchParams();
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

      await _call?.getOrCreate({
        ring: true,
        data: {
          members,
          custom: {
            triggeredBy: chatClient.user?.id,
            members,
          },
        },
      });

      if (updateCall === 'true') {
        await _call?.update({
          custom: {
            triggeredBy: chatClient.user?.id,
            members,
          },
        });
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
  }, [chatClient, id, videoClient, updateCall, router]);

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
