import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSignUp, useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/auth.styles.js";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import { Image } from "expo-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as WebBrowser from "expo-web-browser";

// Warm up the browser for OAuth
WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setError(""); // Clear any previous errors
      setPendingVerification(true);
    } catch (err) {
      console.log("[e:", err.errors?.[0]?.message || err.message, "]");
      
      // Get the actual error message from Clerk
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "An error occurred. Please try again.";
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google OAuth Sign Up
  const onGoogleSignUp = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace("/");
      }
    } catch (err) {
      console.log("[OAuth Error:", err.message, "]");
      setError("Google sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.log("[e:", err.errors?.[0]?.message || err.message, "]");
      
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "Verification failed. Please try again.";
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationTitle}>Verify your email</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.verificationInput, error && styles.errorInput]}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor="#9A8478"
          onChangeText={(code) => setCode(code)}
        />

        <TouchableOpacity 
          onPress={onVerifyPress} 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Verifying..." : "Verify"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
          {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.input, error && styles.errorInput]}
          autoCapitalize="none"
          value={emailAddress}
          placeholderTextColor="#9A8478"
          placeholder="Enter email"
          onChangeText={(email) => setEmailAddress(email)}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.passwordInput, error && styles.errorInput]}
            value={password}
            placeholder="Enter password"
            placeholderTextColor="#9A8478"
            secureTextEntry={!showPassword}
            onChangeText={(password) => setPassword(password)}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={22} 
              color={COLORS.textLight} 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={onSignUpPress}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Signing Up..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        {/* Divider with OR */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        {/* Google Sign Up Button */}
        <TouchableOpacity 
          style={[styles.googleButton, isLoading && styles.googleButtonDisabled]} 
          onPress={onGoogleSignUp}
          disabled={isLoading}
        >
          <Ionicons name="logo-google" size={20} color={COLORS.text} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
