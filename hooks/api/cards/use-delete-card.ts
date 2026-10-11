import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteCard } from '@/lib/api/cards'
import { cardQueryKeys, deckQueryKeys } from '@/hooks/query-keys'

/**
 * Hook to delete a card
 * Invalidates the deck detail query on success
 */
export const useDeleteCard = (id: string, deckId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: cardQueryKeys.delete(id),
    mutationFn: () => deleteCard(id),
    onSuccess: () => {
      // Invalidate the specific deck that this card belongs to
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.detail(deckId) })
    },
  })
}
