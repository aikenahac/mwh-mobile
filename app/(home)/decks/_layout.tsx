import { Stack } from 'expo-router';

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
          presentation: 'card'
        }}
      />
    </Stack>
  );
}
