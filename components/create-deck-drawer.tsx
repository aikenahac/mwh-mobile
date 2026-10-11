import type { Deck } from '@/lib/api';
import { useCreateDeck } from '@/hooks/api/decks';
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
  onDeckCreated?: (deck: Deck) => void;
};

export function CreateDeckDrawer({ open, onOpenChange, onDeckCreated }: Props) {
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const createDeckMutation = useCreateDeck();

  function handleCreateDeck() {
    if (!newDeckName.trim()) {
      Alert.alert('Error', 'Please enter a deck name');
      return;
    }

    createDeckMutation.mutate(
      {
        name: newDeckName,
        description: newDeckDescription || undefined,
      },
      {
        onSuccess: (newDeck) => {
          setNewDeckName('');
          setNewDeckDescription('');
          onDeckCreated?.(newDeck);
          onOpenChange?.(false);
        },
        onError: (err) => {
          Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create deck');
        },
      }
    );
  }

  function handleCancel() {
    setNewDeckName('');
    setNewDeckDescription('');
    onOpenChange?.(false);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button size="lg">
          <Text>New Deck</Text>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Deck</DrawerTitle>
          <DrawerDescription>
            Create a new deck to organize your cards
          </DrawerDescription>
        </DrawerHeader>
        <View className="gap-4 py-4">
          <View className="gap-2">
            <Label nativeID="name">Deck Name</Label>
            <Input
              value={newDeckName}
              onChangeText={setNewDeckName}
              placeholder="Enter deck name"
              aria-labelledby="name"
            />
          </View>
          <View className="gap-2">
            <Label nativeID="description">Description</Label>
            <Input
              value={newDeckDescription}
              onChangeText={setNewDeckDescription}
              placeholder="Enter description (optional)"
              aria-labelledby="description"
              multiline
              numberOfLines={3}
              className="h-auto min-h-[80px]"
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
            <Button onPress={handleCreateDeck} disabled={createDeckMutation.isPending}>
              <Text>{createDeckMutation.isPending ? 'Creating...' : 'Create'}</Text>
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
