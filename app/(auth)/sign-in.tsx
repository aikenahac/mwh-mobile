import OAuthButton from "@/components/oauth-button";
import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { isValidEmail } from "@/lib/utils";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Image, Linking, Platform, View } from "react-native";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const colorScheme = useColorScheme();

  const onSignInPress = async () => {
    if (!isLoaded) return;

    if (emailAddress.length === 0 || password.length === 0) {
      Alert.alert("Error", "Please enter all details");
      return;
    }

    if (!isValidEmail(emailAddress)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "needs_second_factor") {
        await signInAttempt.prepareSecondFactor({ strategy: "email_code" });
        setPendingVerification(true);
      } else if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Sign in incomplete. Please try again.");
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Error", err?.errors?.[0]?.message || "Failed to sign in");
    }
  };

  const openMailApp = async () => {
    const mailUrl = Platform.select({
      ios: "message://",
      android: "mailto:",
      default: "mailto:",
    });

    try {
      const supported = await Linking.canOpenURL(mailUrl);
      if (supported) {
        await Linking.openURL(mailUrl);
      }
    } catch (error) {
      console.error("Error opening mail app:", error);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signIn.attemptSecondFactor({
        code,
        strategy: "email_code",
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
        Alert.alert("Error", "Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
      Alert.alert(
        "Error",
        err?.errors?.[0]?.message || "Failed to verify code",
      );
    }
  };

  if (pendingVerification) {
    return (
      <ScreenContainer className="flex flex-col items-center w-screen h-screen justify-between">
        <View className="h-12" />

        <Image
          source={{ uri: "splash-icon" }}
          style={{ width: 128, height: 128 }}
        />

        <View className="my-4 w-full gap-4">
          <Text>Please check your email for a verification code</Text>
          <OtpInput value={code} onChange={(code) => setCode(code)} />
          <Button onPress={openMailApp} variant="secondary">
            <Icon as={Mail} className="text-muted-foreground" />
            <Text>Open Mail App</Text>
          </Button>
        </View>
        <View className="w-full">
          <Button onPress={onVerifyPress} size="lg">
            <Text>Verify</Text>
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex flex-col items-center w-screen h-screen justify-between">
      <View className="h-12" />

      <Image
        source={{ uri: "splash-icon" }}
        style={{ width: 128, height: 128 }}
      />

      <View className="w-full flex flex-row items-center justify-between gap-2">
        <OAuthButton strategy="oauth_google">
                  <Image
                    source={{ uri: "google_icon" }}
                    style={{ width: 18, height: 18 }}
                  />
                </OAuthButton>
        
                <OAuthButton strategy="oauth_apple">
                  <Image
                    source={{
                      uri:
                        colorScheme === "dark" ? "apple_icon_light" : "apple_icon_dark",
                    }}
                    style={{ width: 15, height: 18 }}
                  />
                </OAuthButton>
      </View>

      <Separator />

      <View className="my-4 w-full gap-4">
        <Text className="font-bold text-3xl">Sign In</Text>
        <View className="w-full gap-2">
          <Label>Email</Label>
          <Input
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Enter your email"
            onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
          />
        </View>

        <View className="w-full gap-2">
          <Label>Password</Label>
          <Input
            value={password}
            placeholder="Enter your password"
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
          />
        </View>
      </View>

      <Button onPress={onSignInPress} className="w-full" size="lg">
        <Text>Continue</Text>
      </Button>

      <View className="flex flex-row gap-1">
        <Text>Don&apos;t have an account?</Text>
        <Link href="/(auth)/sign-up">
          <Text className="text-primary font-bold">Sign up</Text>
        </Link>
      </View>
    </ScreenContainer>
  );
}
