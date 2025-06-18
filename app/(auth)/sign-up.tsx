import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import Screen from '@/components/Screen';
import TextField from '@/components/TextField';
import Button from '../../components/Button';

function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: emailAddress.toLowerCase(),
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('/chats');
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
    return (
      <Screen viewClassName="pt-10 px-4 gap-4">
        <View className="gap-3">
          <Text className="text-center text-3xl font-semibold">
            Verify email address
          </Text>
          <Text className="text-center text-base text-gray-500">
            Enter the code we sent to {emailAddress.toLowerCase()}
          </Text>
          <Link href="/sign-up">
            <Text className="text-base text-center text-blue-600">
              Wrong email?
            </Text>
          </Link>
        </View>
        <TextField
          value={code}
          placeholder="Enter your verification code"
          onChangeText={(code) => setCode(code)}
        />
        <TouchableOpacity onPress={onVerifyPress}>
          <Text>Verify</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  return (
    <Screen viewClassName="pt-10 px-4 gap-4">
      <View className="gap-3">
        <Text className="text-center text-3xl font-semibold">Sign up</Text>
        <Text className="text-center text-base text-gray-500">
          Create an account to get started
        </Text>
      </View>
      <TextField
        value={firstName}
        placeholder="Enter first name"
        onChangeText={(name) => setFirstName(name)}
      />
      <TextField
        value={lastName}
        placeholder="Enter last name"
        onChangeText={(name) => setLastName(name)}
      />
      <TextField
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={(email) => setEmailAddress(email)}
      />
      <TextField
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
      />
      <Button onPress={onSignUpPress}>
        <Text>Continue</Text>
      </Button>
      <View style={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
        <Text>Already have an account?</Text>
        <Link href="/sign-in">
          <Text className="text-blue-600">Sign in</Text>
        </Link>
      </View>
    </Screen>
  );
}

export default SignUpScreen;
