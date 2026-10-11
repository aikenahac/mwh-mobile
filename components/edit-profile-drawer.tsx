import { PencilIcon } from '@/lib/icons';
import { useUser } from '@clerk/clerk-expo';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Button } from './ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Text } from './ui/text';

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function EditProfileDrawer({ open, onOpenChange }: Props) {
  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [updating, setUpdating] = useState(false);

  async function handleUpdateProfile() {
    if (!user) return;

    try {
      setUpdating(true);
      await user.update({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        username: username || undefined,
      });
      Alert.alert('Success', 'Profile updated successfully');
      onOpenChange?.(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  }

  function handleCancel() {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setUsername(user?.username || '');
    onOpenChange?.(false);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <PencilIcon size={20} className="text-foreground" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit Profile</DrawerTitle>
          <DrawerDescription>
            Update your profile information
          </DrawerDescription>
        </DrawerHeader>
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
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" onPress={handleCancel}>
              <Text>Cancel</Text>
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button onPress={handleUpdateProfile} disabled={updating}>
              <Text>{updating ? 'Saving...' : 'Save'}</Text>
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
