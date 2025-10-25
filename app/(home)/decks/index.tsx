import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { getDecks, type DeckWithRelations } from '@/lib/api'
import { useApiClient } from '@/lib/api/client'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native'

export default function DecksPage() {
  // Initialize API client with Clerk auth
  useApiClient()

  const router = useRouter()
  const [decks, setDecks] = useState<DeckWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDecks()
  }, [])

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
          <Button size="lg">
            <Text>New Deck</Text>
          </Button>
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
                console.log(`Navigating to deck ${deck.id}`)
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
