import { SignOutButton } from '@/components/sign-out-button'
import { EditProfileDialog } from '@/components/edit-profile-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { BOTTOM_PADDING_OFFSET } from '@/lib/constants'
import { CameraIcon } from '@/lib/icons'
import { useUser } from '@clerk/clerk-expo'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ProfilePage() {
  const { user } = useUser()
  const insets = useSafeAreaInsets()
  const [uploadingImage, setUploadingImage] = useState(false)

  async function handleImagePick() {
    if (!user) return

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to change your profile picture.')
      return
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (result.canceled) return

    try {
      setUploadingImage(true)

      // Convert image to base64
      const response = await fetch(result.assets[0].uri)
      const blob = await response.blob()
      const reader = new FileReader()

      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string
          await user.setProfileImage({ file: base64data })
          Alert.alert('Success', 'Profile picture updated successfully')
        } catch (error) {
          console.error('Failed to upload image:', error)
          Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload image')
        } finally {
          setUploadingImage(false)
        }
      }

      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Failed to process image:', error)
      Alert.alert('Error', 'Failed to process image')
      setUploadingImage(false)
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + BOTTOM_PADDING_OFFSET }}
    >
      <View className="p-6 gap-6">
        {/* Profile Header */}
        <View className="items-center gap-4">
          <View className="relative">
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

            {/* Change Photo Button */}
            <Pressable
              onPress={handleImagePick}
              disabled={uploadingImage}
              className="absolute bottom-0 right-0 bg-primary rounded-full p-2 active:opacity-80"
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <CameraIcon size={16} className="text-background" />
              )}
            </Pressable>
          </View>

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
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </View>
              <EditProfileDialog />
            </View>
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
