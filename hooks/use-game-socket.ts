/**
 * Game Socket Hook for React Native
 *
 * Provides typed Socket.io connection and event handlers for the game.
 * Auto-connects on mount and provides utilities for emitting events.
 */

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import Constants from 'expo-constants'

// Socket event types for type safety
export interface ClientToServerEvents {
  // Lobby events
  'create-game': (
    data: { nickname: string; clerkUserId: string | null },
    callback: (response: SocketResponse<{ sessionId: string; joinCode: string }>) => void
  ) => void
  'join-game': (
    data: { joinCode: string; nickname: string; clerkUserId: string | null },
    callback: (response: SocketResponse<{ session: any }>) => void
  ) => void
  'leave-game': (data: { sessionId: string }, callback: (response: SocketResponse<void>) => void) => void

  // Owner-only events
  'update-decks': (
    data: { sessionId: string; deckIds: string[]; clerkUserId: string | null },
    callback: (response: SocketResponse<any>) => void
  ) => void
  'update-settings': (
    data: { sessionId: string; settings: any; clerkUserId: string | null },
    callback: (response: SocketResponse<void>) => void
  ) => void
  'start-game': (
    data: { sessionId: string; clerkUserId: string | null },
    callback: (response: SocketResponse<void>) => void
  ) => void
  'kick-player': (
    data: { sessionId: string; playerId: string; clerkUserId: string | null },
    callback: (response: SocketResponse<void>) => void
  ) => void
  'end-game-early': (
    data: { sessionId: string; clerkUserId: string | null },
    callback: (response: SocketResponse<void>) => void
  ) => void

  // Gameplay events
  'submit-cards': (
    data: { roundId: string; cardIds: string[] },
    callback: (response: SocketResponse<void>) => void
  ) => void
  'select-winner': (
    data: { roundId: string; submissionId: string },
    callback: (response: SocketResponse<void>) => void
  ) => void

  // Connection events
  'reconnect-to-game': (
    data: { sessionId: string; clerkUserId: string | null; playerId?: string },
    callback: (response: SocketResponse<{ session: any; hand?: string[] }>) => void
  ) => void
}

export interface ServerToClientEvents {
  // Lobby events
  'game-created': (data: { sessionId: string; joinCode: string; ownerId: string }) => void
  'player-joined': (data: { player: any }) => void
  'player-left': (data: { playerId: string; playerNickname: string }) => void
  'player-disconnected': (data: { playerId: string }) => void
  'player-reconnected': (data: { playerId: string }) => void

  // Deck selection events
  'decks-updated': (data: any) => void
  'settings-updated': (data: { settings: any }) => void

  // Game start
  'game-started': (data: { players: any[]; settings: any }) => void

  // Round events
  'round-started': (data: any) => void
  'cards-dealt': (data: { hand: string[] }) => void
  'card-submitted': (data: { submissionCount: number; totalPlayers: number }) => void
  'all-cards-submitted': (data: { submissions: any[] }) => void

  // Winner selection
  'winner-selected': (data: {
    winnerId: string
    winnerNickname: string
    winningSubmission: any
    points: number
    allSubmissions: any[]
  }) => void
  'round-ended': (data: { scores: Array<{ playerId: string; score: number }>; nextCzarId: string }) => void

  // Game end
  'game-ended': (data: any) => void

  // Ownership transfer
  'owner-changed': (data: { newOwnerId: string; newOwnerNickname: string }) => void

  // Error handling
  error: (data: { message: string; code: string }) => void
}

export interface SocketResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
  }
}

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>

export function useGameSocket() {
  const [socket, setSocket] = useState<GameSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<GameSocket | null>(null)

  useEffect(() => {
    // Get the API URL from environment
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl || ''

    // Convert API URL to socket URL (remove /api suffix if present)
    const socketUrl = apiUrl.replace(/\/api$/, '')

    console.log('[Socket] Connecting to:', socketUrl)

    // Create socket connection
    const newSocket: GameSocket = io(socketUrl, {
      path: '/socket.io',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    })

    socketRef.current = newSocket

    newSocket.on('connect', () => {
      console.log('[Socket] Connected:', newSocket.id)
      setConnected(true)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
      setConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error)
    })

    setSocket(newSocket)

    return () => {
      console.log('[Socket] Cleaning up connection')
      newSocket.close()
    }
  }, [])

  return { socket, connected }
}

/**
 * Hook for managing game socket event listeners
 * Automatically handles cleanup
 */
export function useGameSocketListener<K extends keyof ServerToClientEvents>(
  socket: GameSocket | null,
  event: K,
  handler: ServerToClientEvents[K]
) {
  useEffect(() => {
    if (!socket) return

    socket.on(event, handler as any)

    return () => {
      socket.off(event, handler as any)
    }
  }, [socket, event, handler])
}
