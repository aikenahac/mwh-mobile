import { Stack } from 'expo-router'

export default function GamesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Games' }} />
      <Stack.Screen
        name="[sessionId]"
        options={{
          title: 'Game Session',
          headerBackTitle: 'Leave',
        }}
      />
    </Stack>
  )
}
