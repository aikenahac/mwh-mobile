/**
 * Player List Component
 *
 * Displays list of players with indicators for owner, czar, and connection status.
 * Shows player nicknames and current scores.
 */

import { View } from 'react-native'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/ui/text'
import { Crown, Star } from '@/lib/icons'
import type { PlayerData } from '@/lib/api/schemas'

interface PlayerListProps {
  players: PlayerData[]
  czarId?: string
}

export function GamePlayerList({ players, czarId }: PlayerListProps) {
  return (
    <View className="gap-2">
      {players.map((player) => (
        <Card key={player.id}>
          <CardContent className="flex-row items-center justify-between p-3">
            <View className="flex-row items-center gap-2 flex-1 min-w-0">
              {player.isOwner && <Crown className="text-yellow-500" size={16} />}
              {player.id === czarId && <Star className="text-blue-500" size={16} />}
              <Text className="font-medium flex-1" numberOfLines={1}>
                {player.nickname}
              </Text>
              {!player.isConnected && (
                <Badge variant="secondary">
                  <Text className="text-xs">Offline</Text>
                </Badge>
              )}
            </View>
            <Text className="font-bold ml-2">{player.score}</Text>
          </CardContent>
        </Card>
      ))}
    </View>
  )
}
