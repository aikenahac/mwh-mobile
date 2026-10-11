import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateDeck } from '@/lib/api/decks'
import { deckQueryKeys } from '@/hooks/query-keys'
import type { UpdateDeck } from '@/lib/api/schemas'

/**
 * Hook to update an existing deck
 * Invalidates both the specific deck and the decks list on success
 */
export const useUpdateDeck = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: deckQueryKeys.update(id),
    mutationFn: (data: UpdateDeck) => updateDeck(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.list() })
    },
  })
}
