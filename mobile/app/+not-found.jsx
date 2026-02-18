import { View, Text, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

import { COLORS } from "@/constants/colors";


export default function NotFoundScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const isOAuthCallback = 
      params.created_session_id || 
      params.rotating_token_nonce;

    if (isOAuthCallback) {
      setTimeout(() => {
        router.replace("/");
      }, 1500);
    } else {
      setTimeout(() => {
        router.replace("/");
      }, 2000);
    }
  }, [params]);

  const isOAuthCallback = params.created_session_id || params.rotating_token_nonce;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      {isOAuthCallback ? (
        <>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text
            style={{
              marginTop: 20,
              fontSize: 18,
              color: COLORS.text,
              textAlign: "center",
            }}
          >
            Completing sign in...
          </Text>
        </>
      ) : (
        <>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: COLORS.text,
              marginBottom: 10,
            }}
          >
            Page Not Found
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: COLORS.textLight,
              textAlign: "center",
            }}
          >
            Redirecting to home...
          </Text>
        </>
      )}
    </View>
  );
}
