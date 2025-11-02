import type { Deck } from '@/lib/api';
import { createDeck } from '@/lib/api';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Text } from './ui/text';

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDeckCreated?: (deck: Deck) => void;
};

export function CreateDeckDialog({ open, onOpenChange, onDeckCreated }: Props) {
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleCreateDeck() {
    if (!newDeckName.trim()) {
      Alert.alert('Error', 'Please enter a deck name');
      return;
    }

    try {
      setCreating(true);
      const newDeck = await createDeck({
        name: newDeckName,
        description: newDeckDescription || undefined,
      });
      setNewDeckName('');
      setNewDeckDescription('');
      onDeckCreated?.(newDeck);
      onOpenChange?.(false);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create deck');
    } finally {
      setCreating(false);
    }
  }

  function handleCancel() {
    setNewDeckName('');
    setNewDeckDescription('');
    onOpenChange?.(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Text>New Deck</Text>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
          <DialogDescription>
            Create a new deck to organize your cards
          </DialogDescription>
        </DialogHeader>
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
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onPress={handleCancel}>
              <Text>Cancel</Text>
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onPress={handleCreateDeck} disabled={creating}>
              <Text>{creating ? 'Creating...' : 'Create'}</Text>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
