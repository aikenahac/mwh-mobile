/**
 * Games Index Screen
 *
 * Main game lobby where users can:
 * - Create a new game
 * - Join an existing game with a code
 * - View their recent games
 */

import { useState } from 'react'
import { View, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useUser } from '@clerk/clerk-expo'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGameSocket } from '@/hooks/use-game-socket'
import { GamePlus, LogIn } from '@/lib/icons'

export default function GamesIndexScreen() {
  const router = useRouter()
  const { user } = useUser()
  const { socket, connected } = useGameSocket()

  const [nickname, setNickname] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  const handleCreateGame = () => {
    if (!nickname.trim()) {
      Alert.alert('Nickname Required', 'Please enter a nickname to create a game.')
      return
    }

    if (!socket || !connected) {
      Alert.alert('Not Connected', 'Please wait for the connection to establish.')
      return
    }

    setIsCreating(true)

    socket.emit(
      'create-game',
      {
        nickname: nickname.trim(),
        clerkUserId: user?.id || null,
      },
      (response) => {
        setIsCreating(false)

        if (response.success && response.data) {
          // Navigate to the game session
          router.push(`/games/${response.data.sessionId}`)
        } else {
          Alert.alert('Error', response.error?.message || 'Failed to create game')
        }
      }
    )
  }

  const handleJoinGame = () => {
    if (!nickname.trim()) {
      Alert.alert('Nickname Required', 'Please enter a nickname to join a game.')
      return
    }

    if (!joinCode.trim()) {
      Alert.alert('Join Code Required', 'Please enter a game code.')
      return
    }

    if (!socket || !connected) {
      Alert.alert('Not Connected', 'Please wait for the connection to establish.')
      return
    }

    setIsJoining(true)

    socket.emit(
      'join-game',
      {
        joinCode: joinCode.trim().toUpperCase(),
        nickname: nickname.trim(),
        clerkUserId: user?.id || null,
      },
      (response) => {
        setIsJoining(false)

        if (response.success && response.data) {
          // Navigate to the game session
          router.push(`/games/${response.data.session.id}`)
        } else {
          Alert.alert('Error', response.error?.message || 'Failed to join game')
        }
      }
    )
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-4">
        {/* Connection Status */}
        <View className="flex-row items-center justify-between">
          <Text className="text-muted-foreground">Socket Status:</Text>
          <View className="flex-row items-center gap-2">
            <View className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className="text-sm">{connected ? 'Connected' : 'Disconnected'}</Text>
          </View>
        </View>

        {/* Create Game Section */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Game</CardTitle>
            <CardDescription>Start a new game and invite your friends</CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <View>
              <Text className="text-sm text-muted-foreground mb-2">Your Nickname</Text>
              <Input
                placeholder="Enter your nickname"
                value={nickname}
                onChangeText={setNickname}
                maxLength={20}
                autoCapitalize="words"
              />
            </View>

            <Button
              onPress={handleCreateGame}
              disabled={!connected || isCreating}
              className="flex-row gap-2"
            >
              <GamePlus className="text-primary-foreground" size={20} />
              <Text className="text-primary-foreground font-medium">
                {isCreating ? 'Creating...' : 'Create Game'}
              </Text>
            </Button>
          </CardContent>
        </Card>

        {/* Join Game Section */}
        <Card>
          <CardHeader>
            <CardTitle>Join Existing Game</CardTitle>
            <CardDescription>Enter a game code to join your friends</CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <View>
              <Text className="text-sm text-muted-foreground mb-2">Your Nickname</Text>
              <Input
                placeholder="Enter your nickname"
                value={nickname}
                onChangeText={setNickname}
                maxLength={20}
                autoCapitalize="words"
              />
            </View>

            <View>
              <Text className="text-sm text-muted-foreground mb-2">Game Code</Text>
              <Input
                placeholder="Enter game code"
                value={joinCode}
                onChangeText={(text) => setJoinCode(text.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
              />
            </View>

            <Button
              onPress={handleJoinGame}
              disabled={!connected || isJoining}
              variant="secondary"
              className="flex-row gap-2"
            >
              <LogIn className="text-secondary-foreground" size={20} />
              <Text className="text-secondary-foreground font-medium">
                {isJoining ? 'Joining...' : 'Join Game'}
              </Text>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Games - Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
            <CardDescription>Your game history will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <Text className="text-muted-foreground text-center py-8">No recent games yet</Text>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  )
}
