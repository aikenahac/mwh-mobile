# API Client

This directory contains the API client for the Mess with Humanity backend, built with Axios and Zod for type-safe API calls.

## Setup

The API client is automatically configured with Clerk authentication. Make sure you have set `EXPO_PUBLIC_API_URL` in your `.env` file:

```bash
EXPO_PUBLIC_API_URL=https://gomwh.com/api
```

For local development:
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## Usage

### Basic Usage

```typescript
import { getDecks, createDeck } from '@/lib/api'

// In a component
async function fetchMyDecks() {
  try {
    const decks = await getDecks()
    console.log(decks)
  } catch (error) {
    console.error('Failed to fetch decks:', error)
  }
}

async function createNewDeck() {
  try {
    const deck = await createDeck({
      name: 'My New Deck',
      description: 'A deck for terrible people'
    })
    console.log('Created deck:', deck)
  } catch (error) {
    console.error('Failed to create deck:', error)
  }
}
```

### Using with React Hook

For components that need to use the API, you can optionally use the `useApiClient` hook to ensure the auth token is set:

```typescript
import { useApiClient } from '@/lib/api'

function MyComponent() {
  useApiClient() // This initializes the API client with Clerk auth

  // Now you can use the API functions
  // ...
}
```

Note: You don't need to use this hook if you're just importing and using the API functions directly - the client is a singleton that's automatically configured when you import it.

## Available Endpoints

### Decks

```typescript
import { getDecks, getDeck, createDeck, updateDeck, deleteDeck } from '@/lib/api'

// Get all decks
const decks = await getDecks()

// Get a specific deck with cards and shares
const deck = await getDeck('deck-id')

// Create a new deck
const newDeck = await createDeck({
  name: 'My Deck',
  description: 'Optional description'
})

// Update a deck
const updatedDeck = await updateDeck('deck-id', {
  name: 'New Name',
  description: 'New description'
})

// Delete a deck
await deleteDeck('deck-id')
```

### Cards

```typescript
import { getCard, createCard, updateCard, deleteCard } from '@/lib/api'

// Get a card
const card = await getCard('card-id')

// Create a card
const newCard = await createCard({
  text: 'A blank card.',
  type: 'white', // 'white' or 'black'
  pick: 1,
  deckId: 'deck-id'
})

// Update a card
const updatedCard = await updateCard('card-id', {
  text: 'Updated text',
  type: 'black',
  pick: 2
})

// Delete a card
await deleteCard('card-id')
```

### Shares

```typescript
import {
  getDeckShares,
  createDeckShare,
  updateDeckShare,
  deleteDeckShare
} from '@/lib/api'

// Get all shares for a deck
const shares = await getDeckShares('deck-id')

// Share a deck with a user
const share = await createDeckShare('deck-id', {
  username: 'target_user',
  permission: 'view' // 'view' or 'collaborate'
})

// Update share permission
const updatedShare = await updateDeckShare('deck-id', 'share-id', {
  permission: 'collaborate'
})

// Remove a share
await deleteDeckShare('deck-id', 'share-id')
```

## Type Definitions

All types are exported from the API module:

```typescript
import type {
  Card,
  CardType,
  CreateCard,
  UpdateCard,
  Deck,
  DeckWithRelations,
  CreateDeck,
  UpdateDeck,
  Share,
  Permission,
  CreateShare,
  UpdateShare,
  ApiResponse,
  ApiError
} from '@/lib/api'
```

## Error Handling

All API functions throw errors on failure. The errors follow the API error format:

```typescript
try {
  const deck = await getDeck('invalid-id')
} catch (error) {
  // error will be the ApiError object
  console.error(error.error.message) // User-friendly error message
  console.error(error.error.code)    // Error code (e.g., 'NOT_FOUND')
}
```

## Validation

All requests and responses are validated using Zod schemas. This ensures type safety and catches API contract violations early.

If the API returns data that doesn't match the expected schema, a validation error will be thrown.
