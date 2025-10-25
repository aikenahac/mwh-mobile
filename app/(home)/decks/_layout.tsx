import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function DecksLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          headerTitle: '',
          headerBackTitle: 'Decks',
          presentation: 'card',
          headerBackground: () => <View className="bg-background flex-1" />,
        }}
      />
    </Stack>
  );
}
