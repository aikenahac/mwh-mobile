// Export API client
export { default as apiClient, useApiClient } from './client'

// Export all schemas and types
export * from './schemas'

// Export deck endpoints
export {
  getDecks,
  getDeck,
  createDeck,
  updateDeck,
  deleteDeck,
} from './decks'

// Export card endpoints
export {
  getCard,
  createCard,
  updateCard,
  deleteCard,
} from './cards'

// Export share endpoints
export {
  getDeckShares,
  createDeckShare,
  updateDeckShare,
  deleteDeckShare,
} from './shares'
