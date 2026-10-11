import { useQuery } from '@tanstack/react-query'
import { getDecks } from '@/lib/api/decks'
import { deckQueryKeys } from '@/hooks/query-keys'

/**
 * Hook to fetch all decks
 */
export const useDecks = () => {
  return useQuery({
    queryKey: deckQueryKeys.list(),
    queryFn: getDecks,
  })
}
