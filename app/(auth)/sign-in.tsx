import { useSignIn, useOAuth } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import { View } from 'react-native'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import * as WebBrowser from 'expo-web-browser'

// Warm up the browser for OAuth
WebBrowser.maybeCompleteAuthSession()

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')

  // Handle Google OAuth sign-in
  const onGoogleSignIn = React.useCallback(async () => {
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

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <View className="flex-1 justify-center items-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <Button onPress={onGoogleSignIn} variant="outline" className="w-full">
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
              onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
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
          <Button onPress={onSignInPress} className="w-full">
            <Text>Continue</Text>
          </Button>
          <View className="flex-row gap-1">
            <Text className="text-muted-foreground">Don't have an account?</Text>
            <Link href="/sign-up">
              <Text className="text-primary">Sign up</Text>
            </Link>
          </View>
        </CardFooter>
      </Card>
    </View>
  )
}