import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import createIconSet from "@expo/vector-icons/createIconSet";
import { Stack } from "expo-router";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import { SafeAreaView } from "react-native-safe-area-context";

// Lucide icon glyph mappings from info.json
const glyphMap = {
  house: 0xe0f5, // home icon
  layers: 0xe52d,
  user: 0xe19f,
};

const LucideIcon = createIconSet(
  glyphMap,
  "Lucide",
  require("@/assets/lucide-font/lucide.ttf"),
);

export default function Layout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <SignedIn>
        <NativeTabs>
          {/* <NativeTabs.Trigger name="index">
            <Icon src={<VectorIcon family={LucideIcon} name="house" />} />
            <Label>Home</Label>
          </NativeTabs.Trigger> */}
          <NativeTabs.Trigger name="decks">
            <Icon src={<VectorIcon family={LucideIcon} name="layers" />} />
            <Label>Decks</Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="profile">
            <Icon src={<VectorIcon family={LucideIcon} name="user" />} />
            <Label>Profile</Label>
          </NativeTabs.Trigger>
        </NativeTabs>
      </SignedIn>
      <SignedOut>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </SignedOut>
    </SafeAreaView>
  );
}
