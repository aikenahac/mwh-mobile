import { Text } from '@/components/ui/text'
import { Card } from '@/lib/api/schemas'
import { cn } from '@/lib/utils'
import { Pressable, View } from 'react-native'

type Props = {
  creator?: boolean
  card: Partial<Card>
  onPress?: () => void
}

export function MWHCard({ creator, card, onPress }: Props) {
  return (
    <Pressable
      className={cn(
        'h-60 w-44 p-4 rounded-xl shadow-lg flex flex-col justify-between',
        card.type === 'white' ? 'bg-white' : 'bg-black',
        {
          'active:opacity-80': !creator && onPress,
        }
      )}
      onPress={onPress}
    >
      <Text
        className={cn(
          'text-lg font-extrabold',
          card.type === 'white' ? 'text-black' : 'text-white'
        )}
      >
        {card.text}
      </Text>

      <View className="flex flex-row items-center justify-between gap-2">
        <Text
          className={cn(
            'text-xs font-bold',
            card.type === 'white' ? 'text-black' : 'text-white'
          )}
        >
          Mess With Humanity
        </Text>
        {card.type === 'black' && card.pick && card.pick > 1 && (
          <View className="flex flex-row items-center gap-1">
            <Text className="font-bold text-white text-xs">PICK</Text>
            <View className="rounded-full h-6 w-6 bg-white flex items-center justify-center">
              <Text className="text-black font-bold text-xs">{card.pick}</Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  )
}
