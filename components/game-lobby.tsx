/**
 * Game Lobby Component
 *
 * Pre-game lobby where players wait for game to start.
 * Owner can select decks and start the game.
 * Displays join code and player list.
 */

import { useState } from 'react'
import { View, ScrollView, Alert, TouchableOpacity } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { useUser } from '@clerk/clerk-expo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { GamePlayerList } from './game-player-list'
import { CopyIcon } from '@/lib/icons'
import type { GameSessionData } from '@/lib/api/schemas'
import type { Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '@/hooks/use-game-socket'

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>

interface GameLobbyProps {
  session: GameSessionData
  socket: GameSocket | null
  isOwner: boolean
}

export function GameLobby({ session, socket, isOwner }: GameLobbyProps) {
  const { user } = useUser()
  const [starting, setStarting] = useState(false)

  const handleCopyJoinCode = async () => {
    await Clipboard.setStringAsync(session.joinCode)
    Alert.alert('Copied!', 'Join code copied to clipboard')
  }

  const handleStartGame = () => {
    if (!socket) return
    if (session.selectedDeckIds.length === 0) {
      Alert.alert('No Decks Selected', 'Please select at least one deck to start the game.')
      return
    }

    setStarting(true)
    socket.emit(
      'start-game',
      {
        sessionId: session.id,
        clerkUserId: user?.id || null,
      },
      (response) => {
        if (!response.success) {
          Alert.alert('Error', response.error?.message || 'Failed to start game')
          setStarting(false)
        }
      }
    )
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-4">
        {/* Header with Join Code */}
        <View className="items-center gap-3">
          <Text className="text-2xl font-bold">Game Lobby</Text>
          <Card className="w-full">
            <CardContent className="items-center p-4">
              <Text className="text-sm text-muted-foreground mb-1">Join Code:</Text>
              <View className="flex-row items-center gap-3">
                <Text className="text-3xl font-mono font-bold">{session.joinCode}</Text>
                <TouchableOpacity onPress={handleCopyJoinCode} className="p-2" activeOpacity={0.7}>
                  <CopyIcon className="text-foreground" size={24} />
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Start Button (Owner Only) */}
        {isOwner && (
          <Button
            size="lg"
            onPress={handleStartGame}
            disabled={starting || session.players.length < 3 || session.selectedDeckIds.length === 0}
          >
            <Text className="text-primary-foreground font-semibold">
              {starting ? 'Starting...' : 'Start Game'}
            </Text>
          </Button>
        )}

        {/* Minimum Players Warning */}
        {session.players.length < 3 && (
          <Card>
            <CardContent className="p-3">
              <Text className="text-sm text-muted-foreground text-center">
                Waiting for more players... (minimum 3 players)
              </Text>
            </CardContent>
          </Card>
        )}

        {/* Players Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              Players ({session.players.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GamePlayerList players={session.players} />
          </CardContent>
        </Card>

        {/* Deck Selection Info */}
        <Card>
          <CardHeader>
            <CardTitle>Selected Decks</CardTitle>
          </CardHeader>
          <CardContent>
            {session.selectedDeckIds.length > 0 ? (
              <Text className="text-sm">
                {session.selectedDeckIds.length} deck(s) selected
              </Text>
            ) : (
              <Text className="text-sm text-muted-foreground">
                {isOwner ? 'Select decks to play with' : 'Waiting for owner to select decks...'}
              </Text>
            )}
          </CardContent>
        </Card>

        {/* Game Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Game Settings</CardTitle>
          </CardHeader>
          <CardContent className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">Points to Win:</Text>
              <Text className="text-sm font-medium">{session.settings.pointsToWin}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">Hand Size:</Text>
              <Text className="text-sm font-medium">{session.settings.handSize}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">Timer:</Text>
              <Text className="text-sm font-medium">
                {session.settings.hasTimer
                  ? `${session.settings.timerSeconds}s`
                  : 'Disabled'}
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  )
}
