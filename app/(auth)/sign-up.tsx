import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import Button from '@/components/Button';
import Screen from '@/components/Screen';
import TextField from '@/components/TextField';
import useUserForm from '@/hooks/useUserForm';
import { getError } from '@/lib/utils';

const SignUpScreen = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const {
    firstName,
    lastName,
    username,
    usernameNumber,
    numberError,
    emailAddress,
    password,
    onChangeFirstName,
    onChangeLastName,
    onChangeUsername,
    onChangeNumber,
    onChangeEmailAddress,
    onChangePassword,
  } = useUserForm();
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded || numberError) return;
    setLoading(true);
    try {
      const finalUsername = `${username}_${usernameNumber}`;
      await signUp.create({
        firstName,
        lastName,
        username: finalUsername,
        emailAddress: emailAddress.toLowerCase(),
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      getError(err);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('/chats');
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      getError(err);
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <Screen viewStyle={styles.view} loadingOverlay={loading}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Verify email address
          </Text>
          <Text style={styles.subtitle}>
            Enter the code we sent to {emailAddress.toLowerCase()}
          </Text>
          <Button
            variant="text"
            style={styles.wrongEmailButton}
            onPress={() => setPendingVerification(false)}
          >
            Wrong email?
          </Button>
        </View>
        <TextField
          value={code}
          placeholder="Enter your verification code"
          keyboardType="numeric"
          onChangeText={(code) => setCode(code)}
        />
        <Button onPress={onVerifyPress}>Verify</Button>
      </Screen>
    );
  }

  return (
    <Screen viewStyle={styles.view} loadingOverlay={loading}>
      <View style={styles.header}>
        <Text style={styles.title}>Sign up</Text>
        <Text style={styles.subtitle}>
          Create an account to get started
        </Text>
      </View>
      <View style={styles.form}>
        <TextField
          value={firstName}
          placeholder="First name"
          onChangeText={onChangeFirstName}
        />
        <TextField
          value={lastName}
          placeholder="Last name"
          onChangeText={onChangeLastName}
        />
        <View style={styles.usernameContainer}>
          <TextField
            autoCapitalize="none"
            value={username}
            placeholder="Username"
            onChangeText={onChangeUsername}
            inputStyle={styles.usernameInput}
          />
          <View style={styles.usernameSuffix}>
            <View style={styles.divider} />
            <TextInput
              keyboardType="number-pad"
              maxLength={2}
              value={usernameNumber}
              onChangeText={onChangeNumber}
              style={[
                styles.numberInput,
                Platform.OS === 'android' && styles.numberInputAndroid,
              ]}
            />
          </View>
          <Text style={[styles.helperText, numberError && styles.errorText]}>
            {numberError ||
              'Usernames are always paired with a set of numbers.'}
          </Text>
        </View>
        <TextField
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Email address"
          onChangeText={onChangeEmailAddress}
        />
        <TextField
          value={password}
          placeholder="Password"
          secureTextEntry={true}
          onChangeText={onChangePassword}
        />
      </View>
      <Button onPress={onSignUpPress}>Continue</Button>
      <View style={styles.footer}>
        <Text>Already have an account?</Text>
        <Link href="/sign-in">
          <Text style={styles.link}>Sign in</Text>
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
  form: {
    gap: 12,
  },
  usernameContainer: {
    position: 'relative',
  },
  usernameInput: {
    paddingRight: 48,
  },
  usernameSuffix: {
    position: 'absolute',
    right: 12,
    top: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  divider: {
    width: 0.5,
    height: 20,
    backgroundColor: '#D1D5DB',
  },
  numberInput: {
    width: 20,
    height: 20,
  },
  numberInputAndroid: {
    width: 32,
    height: 48,
    marginBottom: 14,
  },
  helperText: {
    paddingLeft: 8,
    paddingTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  errorText: {
    color: '#EF4444',
  },
  footer: {
    flexDirection: 'row',
    gap: 3,
  },
  link: {
    color: '#2563eb',
  },
  wrongEmailButton: {
    fontSize: 16,
    color: '#2563eb',
  },
});

export default SignUpScreen;
