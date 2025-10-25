import { SignOutButton } from '@/components/sign-out-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Image, View } from 'react-native'

export default function Page() {
  const { user } = useUser()

  return (
    <View className="flex-1 justify-center items-center p-6 bg-background">
      <SignedIn>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Hello {user?.emailAddresses[0].emailAddress}</CardDescription>
          </CardHeader>
          <CardContent>
            <SignOutButton />
          </CardContent>
        </Card>
      </SignedIn>
      <SignedOut>
        <View className="flex-1 justify-center items-center max-w-md w-full gap-8">
          {/* App Icon */}
          <View className="items-center gap-6">
            <Image
              source={require('@/assets/images/icons/icon.png')}
              className="w-32 h-32"
              resizeMode="contain"
            />

            {/* App Name and Tagline */}
            <View className="items-center gap-2">
              <Text className="text-4xl font-bold text-foreground">
                Mess With Humanity
              </Text>
              <Text className="text-muted-foreground text-center text-base">
                The party game for terrible people
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="w-full gap-4">
            <Link href="/(auth)/sign-in" asChild>
              <Button size="lg" className="w-full">
                <Text>Sign in</Text>
              </Button>
            </Link>
            <Link href="/(auth)/sign-up" asChild>
              <Button size="lg" variant="outline" className="w-full">
                <Text>Create account</Text>
              </Button>
            </Link>
          </View>

          {/* Footer Text */}
          <Text className="text-muted-foreground text-sm text-center px-8">
            Join thousands of players and create hilarious moments
          </Text>
        </View>
      </SignedOut>
    </View>
  )
}