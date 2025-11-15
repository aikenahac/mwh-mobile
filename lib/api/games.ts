/**
 * Game API Client
 *
 * Provides API functions for game-related operations
 */

import { useApiClient } from './client'
import type { Card, DeckInfo, GameHistoryItem, PaginatedGameHistory } from './schemas'

export function useGameApi() {
  const apiClient = useApiClient()

  return {
    /**
     * Get available decks for game (system, owned, and shared)
     */
    async getAvailableDecks(): Promise<DeckInfo[]> {
      const response = await apiClient.get<DeckInfo[]>('/game/decks/available')
      return response.data
    },

    /**
     * Get cards by IDs (for displaying player hand)
     */
    async getCards(cardIds: string[]): Promise<Card[]> {
      const response = await apiClient.get<Card[]>('/game/cards', {
        params: { ids: cardIds.join(',') },
      })
      return response.data
    },

    /**
     * Get game history for the current user
     */
    async getGameHistory(params?: {
      page?: number
      pageSize?: number
      wonOnly?: boolean
      dateFrom?: string
      dateTo?: string
      minPlayers?: number
      maxPlayers?: number
      sortField?: 'completed_at' | 'created_at' | 'duration_minutes' | 'total_rounds_played'
      sortDirection?: 'asc' | 'desc'
    }): Promise<PaginatedGameHistory> {
      const response = await apiClient.get<PaginatedGameHistory>('/game/history', {
        params,
      })
      return response.data
    },

    /**
     * Get details for a specific completed game
     */
    async getGameDetails(gameId: string): Promise<any> {
      const response = await apiClient.get(`/game/history/${gameId}`)
      return response.data
    },

    /**
     * Get user statistics
     */
    async getUserStatistics(): Promise<any> {
      const response = await apiClient.get('/game/statistics')
      return response.data
    },

    /**
     * Get leaderboard
     */
    async getLeaderboard(params?: {
      metric?: 'wins' | 'win_rate' | 'rounds_won'
      limit?: number
    }): Promise<any> {
      const response = await apiClient.get('/game/leaderboard', {
        params,
      })
      return response.data
    },
  }
}
