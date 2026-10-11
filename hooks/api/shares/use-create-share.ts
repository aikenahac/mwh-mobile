import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createDeckShare } from '@/lib/api/shares'
import { shareQueryKeys, deckQueryKeys } from '@/hooks/query-keys'
import type { CreateShare } from '@/lib/api/schemas'

/**
 * Hook to create a new deck share
 * Invalidates the deck detail query on success
 */
export const useCreateShare = (deckId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: shareQueryKeys.create(deckId),
    mutationFn: (data: CreateShare) => createDeckShare(deckId, data),
    onSuccess: () => {
      // Invalidate the specific deck to refresh shares
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.detail(deckId) })
    },
  })
}
