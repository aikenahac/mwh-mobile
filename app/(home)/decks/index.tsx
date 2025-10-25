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
import { createDeck, getDecks, type DeckWithRelations } from '@/lib/api'
import { useApiClient } from '@/lib/api/client'
import * as Haptics from 'expo-haptics'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native'

export default function DecksPage() {
  // Initialize API client with Clerk auth
  useApiClient()

  const router = useRouter()
  const [decks, setDecks] = useState<DeckWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newDeckName, setNewDeckName] = useState('')
  const [newDeckDescription, setNewDeckDescription] = useState('')
  const [creating, setCreating] = useState(false)

  // Reload decks when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadDecks()
    }, [])
  )

  async function loadDecks() {
    try {
      setLoading(true)
      setError(null)
      const data = await getDecks()
      setDecks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load decks')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateDeck() {
    if (!newDeckName.trim()) {
      Alert.alert('Error', 'Please enter a deck name')
      return
    }

    try {
      setCreating(true)
      const newDeck = await createDeck({
        name: newDeckName,
        description: newDeckDescription || undefined,
      })
      setNewDeckName('')
      setNewDeckDescription('')
      await loadDecks()
      router.push(`/(home)/decks/${newDeck.id}`)
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create deck')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Loading decks...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onPress={loadDecks} className="w-full">
              <Text>Retry</Text>
            </Button>
          </CardContent>
        </Card>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 gap-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-foreground">My Decks</Text>
            <Text className="text-muted-foreground mt-1">
              {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
            </Text>
          </View>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg">
                <Text>New Deck</Text>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-md">
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
                  />
                </View>
              </View>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    onPress={() => {
                      setNewDeckName('')
                      setNewDeckDescription('')
                    }}
                  >
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
        </View>

        {decks.length === 0 ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>No decks yet</CardTitle>
              <CardDescription>Create your first deck to get started</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          decks.map((deck) => (
            <Pressable
              key={deck.id}
              onPress={() => {
                if (process.env.EXPO_OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                }
                router.push(`/(home)/decks/${deck.id}`)
              }}
              className="active:opacity-80"
            >
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>{deck.name}</CardTitle>
                  {deck.description && (
                    <CardDescription>{deck.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="gap-2">
                  <Text className="text-sm text-muted-foreground">
                    {deck.cards.length} cards
                  </Text>
                  {deck.shares.length > 0 && (
                    <Text className="text-sm text-muted-foreground">
                      Shared with {deck.shares.length}{' '}
                      {deck.shares.length === 1 ? 'person' : 'people'}
                    </Text>
                  )}
                </CardContent>
              </Card>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  )
}
