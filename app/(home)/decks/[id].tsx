import { EditDeckDrawer } from "@/components/edit-deck-drawer";
import { MWHCard } from "@/components/mwh-card";
import { ShareDeckDrawer } from "@/components/share-deck-drawer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { ViewSharesDrawer } from "@/components/view-shares-drawer";
import { useApiClient } from "@/lib/api/client";
import { Card as CardType } from "@/lib/api/schemas";
import { BOTTOM_PADDING_OFFSET } from "@/lib/constants";
import { PlusIcon, TrashIcon } from "@/lib/icons";
import { useDeck, useDeleteDeck } from "@/hooks/api/decks";
import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
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

  // Use React Query to fetch deck
  const { data: deck, isLoading: loading, error } = useDeck(id!);
  const deleteDeckMutation = useDeleteDeck(id!);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Loading deck...</Text>
      </View>
    );
  }

  if (error || (!loading && !deck)) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : "Deck not found"}
            </CardDescription>
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

  // At this point, deck is guaranteed to exist
  const isOwner = deck!.user_id === user?.id;
  const blackCards = deck!.cards.filter((c) => c.type === "black");
  const whiteCards = deck!.cards.filter((c) => c.type === "white");

  function handleDelete() {
    Alert.alert(
      "Delete Deck",
      `Are you sure you want to delete "${deck!.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteDeckMutation.mutate(undefined, {
              onSuccess: () => {
                router.back();
              },
              onError: (err) => {
                Alert.alert(
                  "Error",
                  err instanceof Error ? err.message : "Failed to delete deck",
                );
              },
            });
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
                <EditDeckDrawer deck={deck} />
                <ShareDeckDrawer
                  deckId={deck.id}
                  shares={deck.shares}
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
            <ViewSharesDrawer shares={deck.shares} shareCount={deck.shares.length} />
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
