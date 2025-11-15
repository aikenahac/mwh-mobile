/**
 * Game Board Component
 *
 * Main gameplay interface showing:
 * - Black card (question)
 * - Player's hand (if not czar)
 * - Submissions (if czar during judging phase)
 */

import { useState, useEffect } from 'react'
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { MWHCard } from '@/components/mwh-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import type { Card as CardData, RoundData, SubmissionData } from '@/lib/api/schemas'
import type { Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '@/hooks/use-game-socket'

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>

interface GameBoardProps {
  socket: GameSocket | null
  currentRound: RoundData
  myHand: CardData[]
  isCzar: boolean
  submissions?: SubmissionData[]
}

export function GameBoard({ socket, currentRound, myHand, isCzar, submissions }: GameBoardProps) {
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [submittedCardIds, setSubmittedCardIds] = useState<string[]>([])

  // Reset submission state when round changes
  useEffect(() => {
    setHasSubmitted(false)
    setSubmittedCardIds([])
    setSelectedCards([])
  }, [currentRound.id])

  const handleSubmit = () => {
    if (!socket || selectedCards.length !== currentRound.blackCard.pick) {
      Alert.alert('Wrong Number of Cards', `Please select ${currentRound.blackCard.pick} card(s)`)
      return
    }

    setSubmitting(true)
    socket.emit('submit-cards', { roundId: currentRound.id, cardIds: selectedCards }, (response) => {
      if (response.success) {
        Alert.alert('Success', 'Cards submitted!')
        setHasSubmitted(true)
        setSubmittedCardIds(selectedCards)
        setSelectedCards([])
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to submit cards')
      }
      setSubmitting(false)
    })
  }

  const handleSelectWinner = (submissionId: string) => {
    if (!socket) return

    socket.emit('select-winner', { roundId: currentRound.id, submissionId }, (response) => {
      if (!response.success) {
        Alert.alert('Error', response.error?.message || 'Failed to select winner')
      }
    })
  }

  const handleCardPress = (cardId: string) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter((id) => id !== cardId))
    } else if (selectedCards.length < currentRound.blackCard.pick) {
      setSelectedCards([...selectedCards, cardId])
    }
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-4">
        {/* Black Card */}
        <View className="items-center">
          <View className="w-64">
            <MWHCard card={currentRound.blackCard} />
          </View>
        </View>

        {/* Czar View - Show Submissions */}
        {isCzar && submissions && (
          <View className="gap-3">
            <Text className="text-xl font-semibold text-center">Select the Winner</Text>
            <View className="gap-3">
              {submissions.map((sub) => (
                <TouchableOpacity key={sub.id} onPress={() => handleSelectWinner(sub.id)}>
                  <Card className="border-2 border-border active:border-primary">
                    <CardContent className="p-4 gap-2">
                      {sub.cards.map((card) => (
                        <View key={card.id} className="items-center">
                          <MWHCard card={card} />
                        </View>
                      ))}
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Player View - Show Hand or Submitted Cards */}
        {!isCzar && (
          <View className="gap-4">
            {hasSubmitted ? (
              <View className="gap-3">
                <Text className="text-xl font-semibold text-center">
                  Waiting for other players...
                </Text>
                <View className="flex-row flex-wrap justify-center gap-3">
                  {myHand
                    .filter((card) => submittedCardIds.includes(card.id))
                    .map((card) => (
                      <View key={card.id} className="w-40">
                        <MWHCard card={card} />
                      </View>
                    ))}
                </View>
              </View>
            ) : (
              <View className="gap-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-xl font-semibold">Your Hand</Text>
                  <Text className="text-sm text-muted-foreground">
                    Select {currentRound.blackCard.pick}
                  </Text>
                </View>

                <Button
                  onPress={handleSubmit}
                  disabled={submitting || selectedCards.length !== currentRound.blackCard.pick}
                >
                  <Text className="text-primary-foreground font-medium">
                    {submitting ? 'Submitting...' : 'Submit Cards'}
                  </Text>
                </Button>

                <View className="flex-row flex-wrap gap-3">
                  {myHand.map((card) => {
                    const isSelected = selectedCards.includes(card.id)
                    return (
                      <TouchableOpacity
                        key={card.id}
                        onPress={() => handleCardPress(card.id)}
                        className="w-[45%]"
                        activeOpacity={0.7}
                      >
                        <View
                          className={`${isSelected ? 'border-4 border-blue-500 rounded-lg scale-95' : ''}`}
                        >
                          <MWHCard card={card} />
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Submission Progress */}
        {!isCzar && !hasSubmitted && (
          <Card>
            <CardContent className="p-3">
              <Text className="text-sm text-center text-muted-foreground">
                {currentRound.submissionCount} / {currentRound.totalPlayers} players submitted
              </Text>
            </CardContent>
          </Card>
        )}
      </View>
    </ScrollView>
  )
}
