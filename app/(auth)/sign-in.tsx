import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import Screen from '@/components/Screen';
import TextField from '@/components/TextField';
import Button from '../../components/Button';

function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/chats');
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <Screen viewClassName="pt-10 px-4 gap-4">
      <View className="gap-3">
        <Text className="text-center text-3xl font-semibold">Sign in</Text>
        <Text className="text-center text-base text-gray-500">
          Enter your email address and password to sign in.
        </Text>
      </View>
      <TextField
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
      />
      <TextField
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
      />
      <Button onPress={onSignInPress}>
        <Text>Continue</Text>
      </Button>
      <View style={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
        <Text>Don&apos;t have an account?</Text>
        <Link href="/sign-up">
          <Text className="text-blue-600">Sign up</Text>
        </Link>
      </View>
    </Screen>
  );
}

export default SignInScreen;
