import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateDeckShare } from '@/lib/api/shares'
import { shareQueryKeys, deckQueryKeys } from '@/hooks/query-keys'
import type { UpdateShare } from '@/lib/api/schemas'

/**
 * Hook to update an existing deck share
 * Invalidates the deck detail query on success
 */
export const useUpdateShare = (deckId: string, shareId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: shareQueryKeys.update(deckId, shareId),
    mutationFn: (data: UpdateShare) => updateDeckShare(deckId, shareId, data),
    onSuccess: () => {
      // Invalidate the specific deck to refresh shares
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.detail(deckId) })
    },
  })
}
