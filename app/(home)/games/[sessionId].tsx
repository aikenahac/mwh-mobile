/**
 * Game Session Screen
 *
 * Main game screen that manages the entire game lifecycle:
 * - Lobby phase (waiting for players)
 * - Playing phase (active gameplay)
 * - Game end phase (results)
 */

import { useState, useEffect, useCallback } from 'react'
import { View, ActivityIndicator, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useUser } from '@clerk/clerk-expo'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { GameLobby } from '@/components/game-lobby'
import { GameBoard } from '@/components/game-board'
import { GamePlayerList } from '@/components/game-player-list'
import { useGameSocket, useGameSocketListener } from '@/hooks/use-game-socket'
import { useGameApi } from '@/lib/api/games'
import type {
  GameSessionData,
  Card,
  RoundData,
  SubmissionData,
  GameEndData,
  PlayerData,
} from '@/lib/api/schemas'

export default function GameSessionScreen() {
  const router = useRouter()
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const { user } = useUser()
  const { socket, connected } = useGameSocket()
  const gameApi = useGameApi()

  const [session, setSession] = useState<GameSessionData | null>(null)
  const [currentRound, setCurrentRound] = useState<RoundData | null>(null)
  const [myHand, setMyHand] = useState<Card[]>([])
  const [submissions, setSubmissions] = useState<SubmissionData[]>([])
  const [gameEnded, setGameEnded] = useState<GameEndData | null>(null)
  const [loading, setLoading] = useState(true)
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null)

  // Get my player data
  const myPlayer = session?.players.find((p) => p.id === myPlayerId)
  const isCzar = myPlayer?.isCardCzar || false
  const isOwner = myPlayer?.isOwner || false

  // Load cards for hand
  const loadHandCards = useCallback(
    async (cardIds: string[]) => {
      try {
        const cards = await gameApi.getCards(cardIds)
        setMyHand(cards)
      } catch (error) {
        console.error('Failed to load hand:', error)
      }
    },
    [gameApi]
  )

  // Socket event listeners
  useGameSocketListener(socket, 'player-joined', (data) => {
    if (session) {
      setSession({
        ...session,
        players: [...session.players, data.player],
      })
    }
  })

  useGameSocketListener(socket, 'player-left', (data) => {
    if (session) {
      setSession({
        ...session,
        players: session.players.filter((p) => p.id !== data.playerId),
      })
    }
  })

  useGameSocketListener(socket, 'settings-updated', (data) => {
    if (session) {
      setSession({
        ...session,
        settings: data.settings,
      })
    }
  })

  useGameSocketListener(socket, 'decks-updated', (data) => {
    if (session) {
      setSession({
        ...session,
        selectedDeckIds: data.decks.map((d) => d.id),
      })
    }
  })

  useGameSocketListener(socket, 'game-started', (data) => {
    if (session) {
      setSession({
        ...session,
        status: 'playing',
        players: data.players,
      })
    }
  })

  useGameSocketListener(socket, 'round-started', (data) => {
    setCurrentRound(data)
    setSubmissions([])
  })

  useGameSocketListener(socket, 'cards-dealt', (data) => {
    loadHandCards(data.hand)
  })

  useGameSocketListener(socket, 'card-submitted', (data) => {
    if (currentRound) {
      setCurrentRound({
        ...currentRound,
        submissionCount: data.submissionCount,
      })
    }
  })

  useGameSocketListener(socket, 'all-cards-submitted', (data) => {
    setSubmissions(data.submissions)
  })

  useGameSocketListener(socket, 'winner-selected', (data) => {
    Alert.alert('Round Winner!', `${data.winnerNickname} won this round!`)
  })

  useGameSocketListener(socket, 'round-ended', (data) => {
    if (session) {
      const updatedPlayers = session.players.map((player) => {
        const scoreUpdate = data.scores.find((s) => s.playerId === player.id)
        return scoreUpdate ? { ...player, score: scoreUpdate.score } : player
      })

      setSession({
        ...session,
        players: updatedPlayers,
      })
    }
  })

  useGameSocketListener(socket, 'game-ended', (data) => {
    setGameEnded(data)
    Alert.alert('Game Over!', `Winner: ${data.winner.nickname}`)
  })

  useGameSocketListener(socket, 'error', (data) => {
    Alert.alert('Error', data.message)
  })

  // Initialize or reconnect to game
  useEffect(() => {
    if (!socket || !connected || !sessionId) return

    setLoading(true)

    // Try to reconnect to existing session
    socket.emit(
      'reconnect-to-game',
      {
        sessionId,
        clerkUserId: user?.id || null,
      },
      (response) => {
        setLoading(false)

        if (response.success && response.data) {
          setSession(response.data.session)

          // Find my player ID
          const myPlayer = response.data.session.players.find(
            (p) => p.clerkUserId === user?.id
          )
          if (myPlayer) {
            setMyPlayerId(myPlayer.id)
          }

          // Load hand if provided
          if (response.data.hand) {
            loadHandCards(response.data.hand)
          }
        } else {
          Alert.alert('Error', response.error?.message || 'Failed to join game', [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ])
        }
      }
    )
  }, [socket, connected, sessionId, user?.id, loadHandCards, router])

  // Handle leaving game
  const handleLeaveGame = () => {
    Alert.alert('Leave Game', 'Are you sure you want to leave?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          if (socket && sessionId) {
            socket.emit('leave-game', { sessionId }, () => {
              router.back()
            })
          } else {
            router.back()
          }
        },
      },
    ])
  }

  if (loading || !session) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Loading game...</Text>
      </View>
    )
  }

  // Game ended - show results
  if (gameEnded) {
    return (
      <View className="flex-1 bg-background p-4">
        <View className="gap-4">
          <Text className="text-2xl font-bold text-center">Game Over!</Text>
          <Text className="text-xl text-center">Winner: {gameEnded.winner.nickname}</Text>
          <Text className="text-sm text-center text-muted-foreground">
            Duration: {gameEnded.duration} minutes
          </Text>
          <Text className="text-sm text-center text-muted-foreground">
            Rounds: {gameEnded.totalRounds}
          </Text>

          <View className="mt-4">
            <Text className="text-lg font-semibold mb-2">Final Scores:</Text>
            {gameEnded.finalScores.map((score, index) => (
              <View key={score.playerId} className="flex-row justify-between p-2 border-b border-border">
                <Text>
                  #{score.placement} {score.nickname}
                </Text>
                <Text className="font-bold">{score.score}</Text>
              </View>
            ))}
          </View>

          <Button onPress={() => router.push('/games')}>
            <Text className="text-primary-foreground font-medium">Back to Lobby</Text>
          </Button>
        </View>
      </View>
    )
  }

  // Lobby phase
  if (session.status === 'lobby') {
    return <GameLobby session={session} socket={socket} isOwner={isOwner} />
  }

  // Playing phase
  if (session.status === 'playing' && currentRound) {
    return (
      <View className="flex-1">
        <GameBoard
          socket={socket}
          currentRound={currentRound}
          myHand={myHand}
          isCzar={isCzar}
          submissions={submissions}
        />
      </View>
    )
  }

  // Fallback
  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Text className="text-muted-foreground">Waiting for game to start...</Text>
      <Button onPress={handleLeaveGame} variant="destructive" className="mt-4">
        <Text className="text-destructive-foreground">Leave Game</Text>
      </Button>
    </View>
  )
}
