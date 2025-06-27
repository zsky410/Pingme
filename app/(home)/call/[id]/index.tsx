import { useUser } from '@clerk/clerk-expo';
import {
  CallContent,
  CallingState,
  DeepPartial,
  HangUpCallButton,
  IncomingCall,
  OutgoingCall,
  RingingCallContent,
  StreamTheme,
  Theme,
  ToggleCameraFaceButton,
  ToggleAudioPublishingButton as ToggleMic,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-native-sdk';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import ToggleVideo from '@/components/ToggleVideo';

const svgContainerStyle = {
  backgroundColor: '#373737',
  width: 48,
  height: 48,
  borderRadius: 24,
};

// @ts-expect-error
const theme: DeepPartial<Theme> = {
  colors: {
    buttonSecondary: '#373737',
    buttonWarning: '#373737',
  },
  joinCallButton: {
    container: svgContainerStyle,
  },
  acceptCallButton: {
    container: svgContainerStyle,
  },
  rejectCallButton: {
    container: svgContainerStyle,
  },
  toggleAudioPublishingButton: {
    svgContainer: svgContainerStyle,
  },
  toggleCameraFaceButton: {
    svgContainer: svgContainerStyle,
  },
  hangupCallButton: {
    svgContainer: {
      ...svgContainerStyle,
      backgroundColor: '#eb5545',
    },
  },
  participantVideoFallback: {
    container: {
      backgroundColor: '#1c1c1ecf',
    },
  },
};

const CallScreen = () => {
  const { updateCall } = useGlobalSearchParams();
  const { user } = useUser();
  const call = useCall();
  const router = useRouter();
  const { useCallCallingState, useCallCustomData } = useCallStateHooks();
  const callingState = useCallCallingState();
  const customData = useCallCustomData();
  const isCallTriggeredByMe =
    customData.triggeredBy === user?.id || updateCall === 'true';

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      router.back();
    }
  }, [callingState, router, call]);

  if (
    [CallingState.RINGING, CallingState.JOINING, CallingState.IDLE].includes(
      callingState
    )
  ) {
    return (
      <StreamTheme style={theme}>
        <View className="flex-1 bg-black">
          <View className="flex-1 bg-white">
            {!isCallTriggeredByMe && <IncomingCall />}
            {isCallTriggeredByMe && <OutgoingCall />}
          </View>
        </View>
      </StreamTheme>
    );
  }

  return (
    <StreamTheme style={theme}>
      <View className="flex-1 bg-black">
        <View className="flex-1 pt-safe bg-white">
          <RingingCallContent
            CallContent={(props) => (
              <CallContent
                {...props}
                layout="spotlight"
                onHangupCallHandler={async () => {
                  await call?.endCall();
                }}
                CallControls={(props) => (
                  <View className="bg-[#1c1c1e] w-full h-[110px] pt-7 flex-row justify-center gap-4 rounded-t-2xl">
                    <ToggleCameraFaceButton />
                    <ToggleVideo />
                    <ToggleMic />
                    <HangUpCallButton
                      onHangupCallHandler={props.onHangupCallHandler}
                    />
                  </View>
                )}
              />
            )}
          />
        </View>
      </View>
    </StreamTheme>
  );
};

export default CallScreen;
