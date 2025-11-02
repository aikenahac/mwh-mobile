import { z } from 'zod'
import api from './client'
import {
  ApiResponse,
  apiResponseSchema,
  CreateDeck,
  Deck,
  deckSchema,
  DeckWithRelations,
  deckWithRelationsSchema,
  UpdateDeck,
} from './schemas'

/**
 * Get all decks owned by or shared with the authenticated user
 */
export async function getDecks(): Promise<DeckWithRelations[]> {
  const response = await api.get<ApiResponse<DeckWithRelations[]>>('/decks')

  const parsed = apiResponseSchema(deckWithRelationsSchema.array()).parse(response.data)

  if (!parsed.success) {
    throw new Error(parsed.error.message)
  }

  return parsed.data
}

/**
 * Get a specific deck with all cards and share information
 */
export async function getDeck(id: string): Promise<DeckWithRelations> {
  const response = await api.get<ApiResponse<DeckWithRelations>>(`/decks/${id}`)
  console.log("API response for getDeck:", JSON.stringify(response.data));

  const parsed = apiResponseSchema(deckWithRelationsSchema).parse(response.data)

  if (!parsed.success) {
    throw new Error(parsed.error.message)
  }

  return parsed.data
}

/**
 * Create a new deck
 */
export async function createDeck(data: CreateDeck): Promise<Deck> {
  const response = await api.post<ApiResponse<Deck>>('/decks', data)

  const parsed = apiResponseSchema(deckSchema).parse(response.data)

  if (!parsed.success) {
    throw new Error(parsed.error.message)
  }

  return parsed.data
}

/**
 * Update a deck's name and/or description (owner only)
 */
export async function updateDeck(id: string, data: UpdateDeck): Promise<Deck> {
  const response = await api.patch<ApiResponse<Deck>>(`/decks/${id}`, data)

  const parsed = apiResponseSchema(deckSchema).parse(response.data)

  if (!parsed.success) {
    throw new Error(parsed.error.message)
  }

  return parsed.data
}

/**
 * Delete a deck (owner only)
 */
export async function deleteDeck(id: string): Promise<void> {
  const response = await api.delete<ApiResponse<{ message: string }>>(`/decks/${id}`)

  const parsed = apiResponseSchema(
    z.object({ message: z.string() })
  ).parse(response.data)

  if (!parsed.success) {
    throw new Error(parsed.error.message)
  }
}
