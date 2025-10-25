import { z } from 'zod'
import api from './client'
import {
  Card,
  CreateCard,
  UpdateCard,
  ApiResponse,
  cardSchema,
  apiResponseSchema,
} from './schemas'

/**
 * Get a specific card by ID
 */
export async function getCard(id: string): Promise<Card> {
  const response = await api.get<ApiResponse<Card>>(`/cards/${id}`)

  const parsed = apiResponseSchema(cardSchema).parse(response.data)

  if (!parsed.success) {
    throw new Error(parsed.error.message)
  }

  return parsed.data
}

/**
 * Create a new card in a deck
 */
export async function createCard(data: CreateCard): Promise<Card> {
  const response = await api.post<ApiResponse<Card>>('/cards', data)

  const parsed = apiResponseSchema(cardSchema).parse(response.data)

  if (!parsed.success) {
    throw new Error(parsed.error.message)
  }

  return parsed.data
}

/**
 * Update a card's text, type, and/or pick value
 */
export async function updateCard(id: string, data: UpdateCard): Promise<Card> {
  const response = await api.patch<ApiResponse<Card>>(`/cards/${id}`, data)

  const parsed = apiResponseSchema(cardSchema).parse(response.data)

  if (!parsed.success) {
    throw new Error(parsed.error.message)
  }

  return parsed.data
}

/**
 * Delete a card
 */
export async function deleteCard(id: string): Promise<void> {
  const response = await api.delete<ApiResponse<{ message: string }>>(`/cards/${id}`)

  const parsed = apiResponseSchema(
    z.object({ message: z.string() })
  ).parse(response.data)

  if (!parsed.success) {
    throw new Error(parsed.error.message)
  }
}
