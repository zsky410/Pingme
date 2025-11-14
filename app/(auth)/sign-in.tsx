import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import Screen from '@/components/Screen';
import TextField from '@/components/TextField';
import useUserForm from '@/hooks/useUserForm';
import { getError } from '@/lib/utils';

const SignInScreen = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const { emailAddress, password, onChangeEmailAddress, onChangePassword } =
    useUserForm();
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/chats');
      } else {
        alert('State incomplete');
      }
    } catch (err) {
      getError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen viewStyle={styles.view} loadingOverlay={loading}>
      <View style={styles.header}>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.subtitle}>
          Enter your email address and password to sign in.
        </Text>
      </View>
      <TextField
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={onChangeEmailAddress}
      />
      <TextField
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={onChangePassword}
      />
      <Button onPress={onSignInPress}>Continue</Button>
      <View style={styles.footer}>
        <Text>Don&apos;t have an account?</Text>
        <Link href="/sign-up">
          <Text style={styles.link}>Sign up</Text>
        </Link>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  view: {
    paddingTop: 40,
    paddingHorizontal: 16,
    gap: 16,
  },
  header: {
    gap: 12,
  },
  title: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '600',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    gap: 3,
  },
  link: {
    color: '#2563eb',
  },
});

export default SignInScreen;
