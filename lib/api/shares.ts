import { z } from 'zod'
import api from './client'
import {
  Share,
  CreateShare,
  UpdateShare,
  ApiResponse,
  shareSchema,
  apiResponseSchema,
} from './schemas'

/**
 * Get all shares for a deck (owner only)
 */
export async function getDeckShares(deckId: string): Promise<Share[]> {
  const response = await api.get<ApiResponse<Share[]>>(`/decks/${deckId}/shares`)

  const parsed = apiResponseSchema(shareSchema.array()).parse(response.data)

  if (!parsed.success) {
    throw new Error(parsed.error.message)
  }

  return parsed.data
}

/**
 * Share a deck with another user by username (owner only)
 */
export async function createDeckShare(deckId: string, data: CreateShare): Promise<Share> {
  const response = await api.post<ApiResponse<Share>>(`/decks/${deckId}/shares`, data)

  const parsed = apiResponseSchema(shareSchema).parse(response.data)

  if (!parsed.success) {
    throw new Error(parsed.error.message)
  }

  return parsed.data
}

/**
 * Update the permission level of an existing share (owner only)
 */
export async function updateDeckShare(
  deckId: string,
  shareId: string,
  data: UpdateShare
): Promise<Share> {
  const response = await api.patch<ApiResponse<Share>>(
    `/decks/${deckId}/shares/${shareId}`,
    data
  )

  const parsed = apiResponseSchema(shareSchema).parse(response.data)

  if (!parsed.success) {
    throw new Error(parsed.error.message)
  }

  return parsed.data
}

/**
 * Remove a deck share (owner only)
 */
export async function deleteDeckShare(deckId: string, shareId: string): Promise<void> {
  const response = await api.delete<ApiResponse<{ message: string }>>(
    `/decks/${deckId}/shares/${shareId}`
  )

  const parsed = apiResponseSchema(
    z.object({ message: z.string() })
  ).parse(response.data)

  if (!parsed.success) {
    throw new Error(parsed.error.message)
  }
}
