/**
 * Query key factories for React Query
 * Organized by domain for proper query grouping and invalidation
 */

export const deckQueryKeys = {
  all: ['decks'] as const,
  lists: () => [...deckQueryKeys.all, 'list'] as const,
  list: () => [...deckQueryKeys.lists()] as const,
  details: () => [...deckQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...deckQueryKeys.details(), id] as const,
  create: () => [...deckQueryKeys.all, 'create'] as const,
  update: (id: string) => [...deckQueryKeys.all, 'update', id] as const,
  delete: (id: string) => [...deckQueryKeys.all, 'delete', id] as const,
}

export const cardQueryKeys = {
  all: ['cards'] as const,
  detail: (id: string) => [...cardQueryKeys.all, id] as const,
  create: () => [...cardQueryKeys.all, 'create'] as const,
  update: (id: string) => [...cardQueryKeys.all, 'update', id] as const,
  delete: (id: string) => [...cardQueryKeys.all, 'delete', id] as const,
}

export const shareQueryKeys = {
  all: ['shares'] as const,
  lists: () => [...shareQueryKeys.all, 'list'] as const,
  list: (deckId: string) => [...shareQueryKeys.lists(), deckId] as const,
  create: (deckId: string) => [...shareQueryKeys.all, 'create', deckId] as const,
  update: (deckId: string, shareId: string) => [...shareQueryKeys.all, 'update', deckId, shareId] as const,
  delete: (deckId: string, shareId: string) => [...shareQueryKeys.all, 'delete', deckId, shareId] as const,
}
