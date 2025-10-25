import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { useOAuth, useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import * as React from 'react'
import { View } from 'react-native'

// Warm up the browser for OAuth
WebBrowser.maybeCompleteAuthSession()

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  // Handle Google OAuth sign-up
  const onGoogleSignUp = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive: oAuthSetActive } = await startOAuthFlow()

      if (createdSessionId && oAuthSetActive) {
        await oAuthSetActive({ session: createdSessionId })
        router.replace('/')
      }
    } catch (err) {
      console.error('OAuth error', JSON.stringify(err, null, 2))
    }
  }, [startOAuthFlow, router])

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (pendingVerification) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verify your email</CardTitle>
            <CardDescription>Enter the verification code sent to your email</CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Label nativeID="code">Verification Code</Label>
              <Input
                value={code}
                placeholder="Enter your verification code"
                onChangeText={(code) => setCode(code)}
                aria-labelledby="code"
              />
            </View>
          </CardContent>
          <CardFooter>
            <Button onPress={onVerifyPress} className="w-full">
              <Text>Verify</Text>
            </Button>
          </CardFooter>
        </Card>
      </View>
    )
  }

  return (
    <View className="flex-1 justify-center items-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Create a new account to get started</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <Button onPress={onGoogleSignUp} variant="outline" className="w-full">
            <Text>Continue with Google</Text>
          </Button>

          <View className="flex-row items-center gap-4">
            <Separator className="flex-1" />
            <Text className="text-muted-foreground text-xs">OR</Text>
            <Separator className="flex-1" />
          </View>

          <View className="gap-2">
            <Label nativeID="email">Email</Label>
            <Input
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Enter email"
              onChangeText={(email) => setEmailAddress(email)}
              aria-labelledby="email"
            />
          </View>
          <View className="gap-2">
            <Label nativeID="password">Password</Label>
            <Input
              value={password}
              placeholder="Enter password"
              secureTextEntry={true}
              onChangeText={(password) => setPassword(password)}
              aria-labelledby="password"
            />
          </View>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button onPress={onSignUpPress} className="w-full">
            <Text>Continue</Text>
          </Button>
          <View className="flex-row gap-1">
            <Text className="text-muted-foreground">Already have an account?</Text>
            <Link href="/sign-in">
              <Text className="text-primary">Sign in</Text>
            </Link>
          </View>
        </CardFooter>
      </Card>
    </View>
  )
}