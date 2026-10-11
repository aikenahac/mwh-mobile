import { useQuery } from '@tanstack/react-query'
import { getDeck } from '@/lib/api/decks'
import { deckQueryKeys } from '@/hooks/query-keys'

/**
 * Hook to fetch a single deck by ID
 */
export const useDeck = (id: string) => {
  return useQuery({
    queryKey: deckQueryKeys.detail(id),
    queryFn: () => getDeck(id),
    enabled: !!id,
  })
}
