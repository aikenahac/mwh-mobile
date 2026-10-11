import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createDeck } from '@/lib/api/decks'
import { deckQueryKeys } from '@/hooks/query-keys'
import type { CreateDeck } from '@/lib/api/schemas'

/**
 * Hook to create a new deck
 * Invalidates the decks list on success
 */
export const useCreateDeck = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: deckQueryKeys.create(),
    mutationFn: (data: CreateDeck) => createDeck(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.list() })
    },
  })
}
