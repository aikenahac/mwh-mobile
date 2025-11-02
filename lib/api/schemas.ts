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
