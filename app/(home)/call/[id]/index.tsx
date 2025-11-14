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
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
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
        <View style={styles.container}>
          <View style={styles.innerContainer}>
            {!isCallTriggeredByMe && <IncomingCall />}
            {isCallTriggeredByMe && <OutgoingCall />}
          </View>
        </View>
      </StreamTheme>
    );
  }

  return (
    <StreamTheme style={theme}>
      <View style={styles.container}>
        <View style={[styles.innerContainer, { paddingTop: insets.top }]}>
          <RingingCallContent
            CallContent={(props) => (
              <CallContent
                {...props}
                layout="spotlight"
                onHangupCallHandler={async () => {
                  await call?.endCall();
                }}
                CallControls={(props) => (
                  <View style={styles.controls}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  innerContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  controls: {
    backgroundColor: '#1c1c1e',
    width: '100%',
    height: 110,
    paddingTop: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});

export default CallScreen;
