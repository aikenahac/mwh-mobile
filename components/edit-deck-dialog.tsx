import { updateDeck } from '@/lib/api/decks';
import type { DeckWithRelations } from '@/lib/api/schemas';
import { PencilIcon } from '@/lib/icons';
import { useEffect, useState } from 'react';
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
  deck: DeckWithRelations | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDeckUpdated?: () => void;
};

export function EditDeckDialog({ deck, open, onOpenChange, onDeckUpdated }: Props) {
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (deck) {
      setEditName(deck.name);
      setEditDescription(deck.description || '');
    }
  }, [deck]);

  async function handleSave() {
    if (!deck) return;

    try {
      setSaving(true);
      await updateDeck(deck.id, {
        name: editName,
        description: editDescription || undefined,
      });
      onDeckUpdated?.();
      onOpenChange?.(false);
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to update deck'
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (deck) {
      setEditName(deck.name);
      setEditDescription(deck.description || '');
    }
    onOpenChange?.(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <PencilIcon size={20} className="text-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Deck</DialogTitle>
          <DialogDescription>
            Update your deck&apos;s name and description
          </DialogDescription>
        </DialogHeader>
        <View className="gap-4 py-4">
          <View className="gap-2">
            <Label nativeID="name">Deck Name</Label>
            <Input
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter deck name"
              aria-labelledby="name"
            />
          </View>
          <View className="gap-2">
            <Label nativeID="description">Description</Label>
            <Input
              value={editDescription}
              onChangeText={setEditDescription}
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
            <Button onPress={handleSave} disabled={saving}>
              <Text>{saving ? 'Saving...' : 'Save'}</Text>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
