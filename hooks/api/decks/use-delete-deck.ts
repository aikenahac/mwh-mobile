import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteDeck } from '@/lib/api/decks'
import { deckQueryKeys } from '@/hooks/query-keys'

/**
 * Hook to delete a deck
 * Invalidates the decks list on success
 */
export const useDeleteDeck = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: deckQueryKeys.delete(id),
    mutationFn: () => deleteDeck(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.list() })
    },
  })
}
