import type { DeckWithRelations } from '@/lib/api/schemas';
import { PencilIcon } from '@/lib/icons';
import { useUpdateDeck } from '@/hooks/api/decks';
import { useEffect, useState } from 'react';
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
  deck: DeckWithRelations | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDeckUpdated?: () => void;
};

export function EditDeckDrawer({ deck, open, onOpenChange, onDeckUpdated }: Props) {
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const updateDeckMutation = useUpdateDeck(deck?.id || '');

  useEffect(() => {
    if (deck) {
      setEditName(deck.name);
      setEditDescription(deck.description || '');
    }
  }, [deck]);

  function handleSave() {
    if (!deck) return;

    updateDeckMutation.mutate(
      {
        name: editName,
        description: editDescription || undefined,
      },
      {
        onSuccess: () => {
          onDeckUpdated?.();
          onOpenChange?.(false);
        },
        onError: (err) => {
          Alert.alert(
            'Error',
            err instanceof Error ? err.message : 'Failed to update deck'
          );
        },
      }
    );
  }

  function handleCancel() {
    if (deck) {
      setEditName(deck.name);
      setEditDescription(deck.description || '');
    }
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
          <DrawerTitle>Edit Deck</DrawerTitle>
          <DrawerDescription>
            Update your deck&apos;s name and description
          </DrawerDescription>
        </DrawerHeader>
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
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" onPress={handleCancel}>
              <Text>Cancel</Text>
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button onPress={handleSave} disabled={updateDeckMutation.isPending}>
              <Text>{updateDeckMutation.isPending ? 'Saving...' : 'Save'}</Text>
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
