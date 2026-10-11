import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCard } from '@/lib/api/cards'
import { cardQueryKeys, deckQueryKeys } from '@/hooks/query-keys'
import type { CreateCard } from '@/lib/api/schemas'

/**
 * Hook to create a new card
 * Invalidates the deck detail query on success
 */
export const useCreateCard = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: cardQueryKeys.create(),
    mutationFn: (data: CreateCard) => createCard(data),
    onSuccess: (_, variables) => {
      // Invalidate the specific deck that this card belongs to
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.detail(variables.deckId) })
    },
  })
}
