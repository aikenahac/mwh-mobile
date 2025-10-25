import { SignOutButton } from '@/components/sign-out-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { BOTTOM_PADDING_OFFSET } from '@/lib/constants'
import { CameraIcon, PencilIcon } from '@/lib/icons'
import { useUser } from '@clerk/clerk-expo'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ProfilePage() {
  const { user } = useUser()
  const insets = useSafeAreaInsets()
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [username, setUsername] = useState(user?.username || '')
  const [updating, setUpdating] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  async function handleUpdateProfile() {
    if (!user) return

    try {
      setUpdating(true)
      await user.update({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        username: username || undefined,
      })
      Alert.alert('Success', 'Profile updated successfully')
    } catch (error) {
      console.error('Failed to update profile:', error)
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setUpdating(false)
    }
  }

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
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <PencilIcon size={20} className="text-foreground" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your profile information
                    </DialogDescription>
                  </DialogHeader>
                  <View className="gap-4 py-4">
                    <View className="gap-2">
                      <Label nativeID="firstName">First Name</Label>
                      <Input
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Enter first name"
                        aria-labelledby="firstName"
                      />
                    </View>
                    <View className="gap-2">
                      <Label nativeID="lastName">Last Name</Label>
                      <Input
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Enter last name"
                        aria-labelledby="lastName"
                      />
                    </View>
                    <View className="gap-2">
                      <Label nativeID="username">Username</Label>
                      <Input
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Enter username"
                        aria-labelledby="username"
                      />
                    </View>
                  </View>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        onPress={() => {
                          setFirstName(user?.firstName || '')
                          setLastName(user?.lastName || '')
                          setUsername(user?.username || '')
                        }}
                      >
                        <Text>Cancel</Text>
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onPress={handleUpdateProfile} disabled={updating}>
                        <Text>{updating ? 'Saving...' : 'Save'}</Text>
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
