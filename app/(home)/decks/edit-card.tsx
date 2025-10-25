import { MWHCard } from "@/components/mwh-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { createCard, deleteCard, updateCard } from "@/lib/api/cards";
import { useApiClient } from "@/lib/api/client";
import type { CardType } from "@/lib/api/schemas";
import { BOTTOM_PADDING_OFFSET } from "@/lib/constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLACK_CARD_LINE = "________";

export default function EditCardPage() {
  useApiClient();

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    deckId: string;
    cardId?: string;
    cardText?: string;
    cardType?: CardType;
    cardPick?: string;
  }>();

  const isEditing = !!params.cardId;

  const [text, setText] = useState(params.cardText || "");
  const [type, setType] = useState<CardType>((params.cardType as CardType) || "white");
  const [pick, setPick] = useState(params.cardPick ? parseInt(params.cardPick, 10) : 1);
  const [customPickValue, setCustomPickValue] = useState(
    pick > 4 ? pick.toString() : "5"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCustomPick = pick > 4;

  useEffect(() => {
    if (params.cardText) setText(params.cardText);
    if (params.cardType) setType(params.cardType as CardType);
    if (params.cardPick) setPick(parseInt(params.cardPick, 10));
  }, [params]);

  const handleSave = async () => {
    if (!text.trim()) {
      Alert.alert("Validation Error", "Card text is required");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing) {
        await updateCard(params.cardId!, {
          text: text.trim(),
          type,
          pick,
        });
        Alert.alert("Success", "Card updated successfully");
      } else {
        await createCard({
          text: text.trim(),
          type,
          pick,
          deckId: params.deckId,
        });
        Alert.alert("Success", "Card created successfully");
      }

      router.back();
    } catch (error) {
      console.error("Failed to save card:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to save card"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!params.cardId) return;

    Alert.alert(
      "Delete Card",
      "Are you sure you want to delete this card? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await deleteCard(params.cardId!);
              Alert.alert("Success", "Card deleted successfully");
              router.back();
            } catch (error) {
              console.error("Failed to delete card:", error);
              Alert.alert(
                "Error",
                error instanceof Error ? error.message : "Failed to delete card"
              );
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + BOTTOM_PADDING_OFFSET }}
    >
      <View className="p-6 gap-4">
        {/* Header */}
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">
            {isEditing ? "Edit Card" : "Create Card"}
          </Text>
        </View>

        {/* Card Editor */}
        <View className="w-full bg-card border-border rounded-xl border p-6 gap-6 shadow-sm shadow-black/5">
          {/* Card Type Selection */}
          <View className="gap-2">
            <Label nativeID="card_type" className="font-bold">
              Type
            </Label>
            <View className="flex flex-row gap-2">
              <Button
                variant={type === "white" ? "default" : "outline"}
                onPress={() => setType("white")}
                size="sm"
                className="flex-1"
              >
                <Text>White</Text>
              </Button>
              <Button
                variant={type === "black" ? "default" : "outline"}
                onPress={() => setType("black")}
                size="sm"
                className="flex-1"
              >
                <Text>Black</Text>
              </Button>
            </View>
          </View>

          {/* Card Text Input */}
          <View className="gap-2">
            <Label nativeID="card_text" className="font-bold">
              Text
            </Label>
            <Input
              nativeID="card_text"
              value={text}
              onChangeText={setText}
              placeholder="Enter card text..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="h-auto min-h-[100px] py-2"
            />
            {type === "black" && (
              <Button
                onPress={() =>
                  setText(`${text}${text ? " " : ""}${BLACK_CARD_LINE}`)
                }
                variant="secondary"
                size="sm"
              >
                <Text>Add Blank Line</Text>
              </Button>
            )}
          </View>

          {/* Pick Value (Black Cards Only) */}
          {type === "black" && (
            <View className="gap-4">
              <View className="gap-2">
                <Label nativeID="card_pick" className="font-bold">
                  Pick
                </Label>
                <View className="flex flex-row gap-2">
                  <Button
                    variant={pick === 1 && !isCustomPick ? "default" : "outline"}
                    onPress={() => setPick(1)}
                    size="sm"
                    className="flex-1"
                  >
                    <Text>1</Text>
                  </Button>
                  <Button
                    variant={pick === 2 && !isCustomPick ? "default" : "outline"}
                    onPress={() => setPick(2)}
                    size="sm"
                    className="flex-1"
                  >
                    <Text>2</Text>
                  </Button>
                  <Button
                    variant={pick === 3 && !isCustomPick ? "default" : "outline"}
                    onPress={() => setPick(3)}
                    size="sm"
                    className="flex-1"
                  >
                    <Text>3</Text>
                  </Button>
                  <Button
                    variant={pick === 4 && !isCustomPick ? "default" : "outline"}
                    onPress={() => setPick(4)}
                    size="sm"
                    className="flex-1"
                  >
                    <Text>4</Text>
                  </Button>
                  <Button
                    variant={isCustomPick ? "default" : "outline"}
                    onPress={() => {
                      const value = parseInt(customPickValue, 10);
                      setPick(
                        isNaN(value) ? 5 : Math.max(5, Math.min(10, value))
                      );
                    }}
                    size="sm"
                    className="flex-1"
                  >
                    <Text>N</Text>
                  </Button>
                </View>
              </View>
              {isCustomPick && (
                <View className="flex flex-row gap-4 items-center">
                  <Label nativeID="custom_pick" className="font-bold">
                    Custom Value:
                  </Label>
                  <Input
                    nativeID="custom_pick"
                    keyboardType="number-pad"
                    value={customPickValue}
                    onChangeText={(value) => {
                      setCustomPickValue(value);
                      const numValue = parseInt(value, 10);
                      if (!isNaN(numValue) && numValue >= 5 && numValue <= 10) {
                        setPick(numValue);
                      }
                    }}
                    className="w-24"
                  />
                  <Text className="text-sm text-muted-foreground">(5-10)</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="gap-2">
          <Button onPress={handleSave} disabled={isSubmitting}>
            <Text>{isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Card"}</Text>
          </Button>

          {isEditing && (
            <Button
              variant="destructive"
              onPress={handleDelete}
              disabled={isSubmitting}
            >
              <Text>Delete Card</Text>
            </Button>
          )}

          <Button variant="outline" onPress={() => router.back()} disabled={isSubmitting}>
            <Text>Cancel</Text>
          </Button>
        </View>

        {/* Preview Card */}
        <View className="w-full bg-card border-border rounded-xl border p-6 items-center shadow-sm shadow-black/5">
          <Label className="font-bold mb-4">Preview</Label>
          <MWHCard card={{ text, type, pick }} creator />
        </View>
      </View>
    </ScrollView>
  );
}
