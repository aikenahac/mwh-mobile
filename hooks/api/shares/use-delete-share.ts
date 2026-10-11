import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteDeckShare } from '@/lib/api/shares'
import { shareQueryKeys, deckQueryKeys } from '@/hooks/query-keys'

/**
 * Hook to delete a deck share
 * Invalidates the deck detail query on success
 */
export const useDeleteShare = (deckId: string, shareId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: shareQueryKeys.delete(deckId, shareId),
    mutationFn: () => deleteDeckShare(deckId, shareId),
    onSuccess: () => {
      // Invalidate the specific deck to refresh shares
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.detail(deckId) })
    },
  })
}
