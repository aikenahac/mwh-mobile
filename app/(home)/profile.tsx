import { SignOutButton } from '@/components/sign-out-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { useUser } from '@clerk/clerk-expo'
import { View, ScrollView, Image } from 'react-native'

export default function ProfilePage() {
  const { user } = useUser()

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 gap-6">
        {/* Profile Header */}
        <View className="items-center gap-4">
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-muted items-center justify-center">
              <Text className="text-4xl text-muted-foreground">
                {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}

          <View className="items-center gap-1">
            <Text className="text-2xl font-bold text-foreground">
              {user?.fullName || 'User'}
            </Text>
            <Text className="text-muted-foreground">
              {user?.emailAddresses[0]?.emailAddress}
            </Text>
          </View>
        </View>

        {/* Account Information */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-1">
              <Text className="text-sm font-medium text-foreground">Username</Text>
              <Text className="text-muted-foreground">
                {user?.username || 'Not set'}
              </Text>
            </View>

            <View className="gap-1">
              <Text className="text-sm font-medium text-foreground">Email</Text>
              <Text className="text-muted-foreground">
                {user?.emailAddresses[0]?.emailAddress}
              </Text>
            </View>

            {user?.firstName && (
              <View className="gap-1">
                <Text className="text-sm font-medium text-foreground">First Name</Text>
                <Text className="text-muted-foreground">
                  {user.firstName}
                </Text>
              </View>
            )}

            {user?.lastName && (
              <View className="gap-1">
                <Text className="text-sm font-medium text-foreground">Last Name</Text>
                <Text className="text-muted-foreground">
                  {user.lastName}
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <SignOutButton />
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  )
}
