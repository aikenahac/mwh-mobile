import { z } from 'zod'

// Card schemas
export const cardTypeSchema = z.enum(['white', 'black'])
export const permissionSchema = z.enum(['view', 'collaborate'])

export const cardSchema = z.object({
  id: z.string().uuid(),
  type: cardTypeSchema,
  pick: z.number().int().min(1).max(10),
  text: z.string(),
  deck_id: z.string().uuid(),
  created_at: z.string().datetime(),
})

export const createCardSchema = z.object({
  text: z.string().min(1),
  type: cardTypeSchema,
  pick: z.number().int().min(1).max(10),
  deckId: z.string().uuid(),
})

export const updateCardSchema = z.object({
  text: z.string().min(1).optional(),
  type: cardTypeSchema.optional(),
  pick: z.number().int().min(1).max(10).optional(),
})

// Share schemas
export const shareSchema = z.object({
  id: z.string(),
  deck_id: z.string(),
  shared_with_user_id: z.string(),
  shared_by_user_id: z.string(),
  permission: permissionSchema,
  created_at: z.string(),
})

export const createShareSchema = z.object({
  username: z.string().min(1),
  permission: permissionSchema,
})

export const updateShareSchema = z.object({
  permission: permissionSchema,
})

// Deck schemas
export const deckSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  user_id: z.string(),
  created_at: z.string().datetime(),
})

export const deckWithRelationsSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  user_id: z.string(),
  created_at: z.string().datetime(),
  cards: z.array(cardSchema),
  shares: z.array(shareSchema).nullish(),
})

export const createDeckSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export const updateDeckSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
})

// API Response schemas
export const apiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  })

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
})

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([
    apiSuccessSchema(dataSchema),
    apiErrorSchema,
  ])

// Type exports
export type Card = z.infer<typeof cardSchema>
export type CardType = z.infer<typeof cardTypeSchema>
export type CreateCard = z.infer<typeof createCardSchema>
export type UpdateCard = z.infer<typeof updateCardSchema>

export type Share = z.infer<typeof shareSchema>
export type Permission = z.infer<typeof permissionSchema>
export type CreateShare = z.infer<typeof createShareSchema>
export type UpdateShare = z.infer<typeof updateShareSchema>

export type Deck = z.infer<typeof deckSchema>
export type DeckWithRelations = z.infer<typeof deckWithRelationsSchema>
export type CreateDeck = z.infer<typeof createDeckSchema>
export type UpdateDeck = z.infer<typeof updateDeckSchema>

export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiError = z.infer<typeof apiErrorSchema>

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ============================================
// GAME TYPES
// ============================================

// Game Settings
export const gameSettingsSchema = z.object({
  pointsToWin: z.number().int().min(1).default(7),
  handSize: z.number().int().min(5).max(15).default(10),
  hasTimer: z.boolean().default(false),
  timerSeconds: z.number().int().min(10).optional(),
})

export const DEFAULT_GAME_SETTINGS = {
  pointsToWin: 7,
  handSize: 10,
  hasTimer: false,
}

// Game State Types
export const gameStatusSchema = z.enum(['lobby', 'playing', 'ended', 'abandoned'])
export const roundStatusSchema = z.enum(['playing', 'judging', 'completed'])

// Player Types
export const playerDataSchema = z.object({
  id: z.string(),
  clerkUserId: z.string().nullable(),
  nickname: z.string(),
  score: z.number(),
  isCardCzar: z.boolean(),
  isOwner: z.boolean(),
  isConnected: z.boolean(),
})

export const playerWithHandSchema = playerDataSchema.extend({
  hand: z.array(z.string()), // Array of card IDs
})

// Deck Info
export const deckInfoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  userId: z.string(),
  isSystem: z.boolean(),
  blackCardCount: z.number(),
  whiteCardCount: z.number(),
  sharedBy: z.string().optional(), // Username if shared deck
})

export const selectedDecksInfoSchema = z.object({
  decks: z.array(deckInfoSchema),
  totalBlackCards: z.number(),
  totalWhiteCards: z.number(),
})

// Round Types
export const roundDataSchema = z.object({
  id: z.string(),
  roundNumber: z.number(),
  blackCard: cardSchema,
  czarPlayerId: z.string(),
  winnerPlayerId: z.string().nullable(),
  status: roundStatusSchema,
  submissionCount: z.number(),
  totalPlayers: z.number(),
})

export const submissionDataSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  playerNickname: z.string().optional(), // Only revealed after winner selected
  cardIds: z.array(z.string()),
  cards: z.array(cardSchema), // Populated when shown to czar
})

// Game Session Types
export const gameSessionDataSchema = z.object({
  id: z.string(),
  joinCode: z.string(),
  ownerId: z.string(),
  status: gameStatusSchema,
  currentRound: z.number(),
  settings: gameSettingsSchema,
  players: z.array(playerDataSchema),
  selectedDeckIds: z.array(z.string()),
  createdAt: z.string().datetime(),
})

// Game End Data
export const gameEndDataSchema = z.object({
  completedGameId: z.string(),
  finalScores: z.array(
    z.object({
      playerId: z.string(),
      nickname: z.string(),
      score: z.number(),
      placement: z.number(),
    })
  ),
  winner: z.object({
    playerId: z.string(),
    nickname: z.string(),
    score: z.number(),
  }),
  duration: z.number(), // minutes
  totalRounds: z.number(),
})

// Socket Response
export const socketResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.object({
      message: z.string(),
      code: z.string(),
    }).optional(),
  })

// Game History
export const gameHistoryItemSchema = z.object({
  id: z.string(),
  completedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  durationMinutes: z.number(),
  totalRoundsPlayed: z.number(),
  wasAbandoned: z.boolean(),
  winnerNickname: z.string().nullable(),
  playerCount: z.number(),
  userPlacement: z.number(),
  userScore: z.number(),
  decks: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
})

export const paginatedGameHistorySchema = z.object({
  items: z.array(gameHistoryItemSchema),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
})

// Type exports
export type GameSettings = z.infer<typeof gameSettingsSchema>
export type GameStatus = z.infer<typeof gameStatusSchema>
export type RoundStatus = z.infer<typeof roundStatusSchema>
export type PlayerData = z.infer<typeof playerDataSchema>
export type PlayerWithHand = z.infer<typeof playerWithHandSchema>
export type DeckInfo = z.infer<typeof deckInfoSchema>
export type SelectedDecksInfo = z.infer<typeof selectedDecksInfoSchema>
export type RoundData = z.infer<typeof roundDataSchema>
export type SubmissionData = z.infer<typeof submissionDataSchema>
export type GameSessionData = z.infer<typeof gameSessionDataSchema>
export type GameEndData = z.infer<typeof gameEndDataSchema>
export type GameHistoryItem = z.infer<typeof gameHistoryItemSchema>
export type PaginatedGameHistory = z.infer<typeof paginatedGameHistorySchema>

// Error codes
export enum GameErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_SESSION = 'INVALID_SESSION',

  // Game state errors
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  GAME_FULL = 'GAME_FULL',
  GAME_ALREADY_STARTED = 'GAME_ALREADY_STARTED',
  GAME_NOT_IN_LOBBY = 'GAME_NOT_IN_LOBBY',

  // Permission errors
  NOT_OWNER = 'NOT_OWNER',
  NOT_CZAR = 'NOT_CZAR',
  NOT_IN_GAME = 'NOT_IN_GAME',

  // Deck errors
  NO_DECKS_SELECTED = 'NO_DECKS_SELECTED',
  INVALID_DECK = 'INVALID_DECK',
  NOT_ENOUGH_CARDS = 'NOT_ENOUGH_CARDS',

  // Gameplay errors
  ALREADY_SUBMITTED = 'ALREADY_SUBMITTED',
  INVALID_SUBMISSION = 'INVALID_SUBMISSION',
  WRONG_NUMBER_OF_CARDS = 'WRONG_NUMBER_OF_CARDS',
  CARDS_NOT_IN_HAND = 'CARDS_NOT_IN_HAND',
  INVALID_WINNER_SELECTION = 'INVALID_WINNER_SELECTION',

  // General errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export class GameError extends Error {
  constructor(
    public code: GameErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'GameError'
  }
}
