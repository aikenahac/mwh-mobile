import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCard } from '@/lib/api/cards'
import { cardQueryKeys, deckQueryKeys } from '@/hooks/query-keys'
import type { UpdateCard } from '@/lib/api/schemas'

/**
 * Hook to update an existing card
 * Invalidates the deck detail query on success
 */
export const useUpdateCard = (id: string, deckId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: cardQueryKeys.update(id),
    mutationFn: (data: UpdateCard) => updateCard(id, data),
    onSuccess: () => {
      // Invalidate the specific deck that this card belongs to
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.detail(deckId) })
    },
  })
}
