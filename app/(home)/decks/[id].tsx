import { MWHCard } from "@/components/mwh-card";
import { ShareDeckDialog } from "@/components/share-deck-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useApiClient } from "@/lib/api/client";
import { deleteDeck, getDeck, updateDeck } from "@/lib/api/decks";
import { Card as CardType, DeckWithRelations } from "@/lib/api/schemas";
import { BOTTOM_PADDING_OFFSET } from "@/lib/constants";
import { PencilIcon, PlusIcon, TrashIcon } from "@/lib/icons";
import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DeckDetailPage() {
  // Initialize API client with Clerk auth
  useApiClient();

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  const [deck, setDeck] = useState<DeckWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const isInitialMount = useRef(true);

  const loadDeck = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDeck(id!);
      setDeck(data);
      setEditName(data.name);
      setEditDescription(data.description || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deck");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadDeck();
    }
  }, [id, loadDeck]);

  // Reload deck when screen comes into focus (after creating/editing cards)
  useFocusEffect(
    useCallback(() => {
      // Skip the initial mount (already handled by useEffect)
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      // Reload deck when coming back from card editor
      if (id) {
        loadDeck();
      }
    }, [id, loadDeck])
  );

  async function handleSave() {
    if (!deck) return;

    try {
      setSaving(true);
      await updateDeck(deck.id, {
        name: editName,
        description: editDescription || undefined,
      });
      await loadDeck();
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to update deck",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deck) return;

    Alert.alert(
      "Delete Deck",
      `Are you sure you want to delete "${deck.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDeck(deck.id);
              router.back();
            } catch (err) {
              Alert.alert(
                "Error",
                err instanceof Error ? err.message : "Failed to delete deck",
              );
            }
          },
        },
      ],
    );
  }

  function handleCreateCard() {
    router.push({
      pathname: "/(home)/decks/edit-card",
      params: { deckId: deck!.id },
    });
  }

  function handleEditCard(card: CardType) {
    if (!isOwner) return;
    router.push({
      pathname: "/(home)/decks/edit-card",
      params: {
        deckId: deck!.id,
        cardId: card.id,
        cardText: card.text,
        cardType: card.type,
        cardPick: card.pick.toString(),
      },
    });
  }

  const isOwner = deck?.user_id === user?.id;
  const blackCards = deck?.cards.filter((c) => c.type === "black") || [];
  const whiteCards = deck?.cards.filter((c) => c.type === "white") || [];

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Loading deck...</Text>
      </View>
    );
  }

  if (error || !deck) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || "Deck not found"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onPress={() => router.back()} className="w-full">
              <Text>Go Back</Text>
            </Button>
          </CardContent>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + BOTTOM_PADDING_OFFSET }}
    >
      <View className="p-6 gap-4">
        {/* Header */}
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-3xl font-bold text-foreground flex-1">
              {deck.name}
            </Text>
            {isOwner && (
              <View className="flex-row gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <PencilIcon size={20} className="text-foreground" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-full max-w-md">
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
                        />
                      </View>
                    </View>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          variant="outline"
                          onPress={() => {
                            setEditName(deck.name);
                            setEditDescription(deck.description || "");
                          }}
                        >
                          <Text>Cancel</Text>
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onPress={handleSave} disabled={saving}>
                          <Text>{saving ? "Saving..." : "Save"}</Text>
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <ShareDeckDialog
                  deckId={deck.id}
                  shares={deck.shares}
                  onSharesUpdate={loadDeck}
                />
                <Button variant="destructive" size="icon" onPress={handleDelete}>
                  <TrashIcon size={20} className="text-white" />
                </Button>
              </View>
            )}
          </View>
          {deck.description && (
            <Text className="text-muted-foreground">
              {deck.description}
            </Text>
          )}

          <View className="flex-row items-center gap-4">
            <Text className="text-sm text-muted-foreground">
              {deck.cards.length} card{deck.cards.length !== 1 ? "s" : ""}
            </Text>
            {deck.shares.length > 0 && (
              <Text className="text-sm text-muted-foreground">
                Shared with {deck.shares.length}
              </Text>
            )}
          </View>
        </View>

        {/* Add Card Button */}
        {isOwner && (
          <Button onPress={handleCreateCard} className="w-full">
            <PlusIcon size={20} />
            <Text>Add Card</Text>
          </Button>
        )}

        {/* Black Cards */}
        {blackCards.length > 0 && (
          <View className="gap-3">
            <Text className="text-xl font-bold text-foreground">
              Black Cards ({blackCards.length})
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="gap-3"
              contentContainerClassName="gap-3"
            >
              {blackCards.map((card) => (
                <MWHCard
                  key={card.id}
                  card={card}
                  onPress={isOwner ? () => handleEditCard(card) : undefined}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* White Cards */}
        {whiteCards.length > 0 && (
          <View className="gap-3">
            <Text className="text-xl font-bold text-foreground">
              White Cards ({whiteCards.length})
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="gap-3"
              contentContainerClassName="gap-3"
            >
              {whiteCards.map((card) => (
                <MWHCard
                  key={card.id}
                  card={card}
                  onPress={isOwner ? () => handleEditCard(card) : undefined}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {deck.cards.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No cards yet</CardTitle>
              <CardDescription>
                Add cards to start building your deck
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
