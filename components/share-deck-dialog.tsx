import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Permission, Share } from "@/lib/api/schemas";
import { createDeckShare, deleteDeckShare, updateDeckShare } from "@/lib/api/shares";
import { ShareIcon } from "@/lib/icons";
import { X } from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";

interface ShareDeckDialogProps {
  deckId: string;
  shares: Share[];
  onSharesUpdate: () => void;
}

export function ShareDeckDialog({ deckId, shares, onSharesUpdate }: ShareDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [permission, setPermission] = useState<Permission>("view");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingShareId, setUpdatingShareId] = useState<string | null>(null);
  const [removingShareId, setRemovingShareId] = useState<string | null>(null);

  const handleShare = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    setIsSubmitting(true);
    try {
      await createDeckShare(deckId, {
        username: username.trim(),
        permission,
      });
      setUsername("");
      setPermission("view");
      setOpen(false);
      onSharesUpdate();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to share deck");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    Alert.alert(
      "Remove Share",
      "Are you sure you want to remove this share? The user will lose access to this deck.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setRemovingShareId(shareId);
            try {
              await deleteDeckShare(deckId, shareId);
              onSharesUpdate();
            } catch (err) {
              Alert.alert("Error", err instanceof Error ? err.message : "Failed to remove share");
            } finally {
              setRemovingShareId(null);
            }
          },
        },
      ]
    );
  };

  const handleUpdatePermission = async (shareId: string, newPermission: Permission) => {
    setUpdatingShareId(shareId);
    try {
      await updateDeckShare(deckId, shareId, { permission: newPermission });
      onSharesUpdate();
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to update permission");
    } finally {
      setUpdatingShareId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <ShareIcon size={20} className="text-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Deck</DialogTitle>
          <DialogDescription>
            Share this deck with other users by entering their username
          </DialogDescription>
        </DialogHeader>

        <ScrollView className="max-h-96">
          <View className="gap-4 py-4">
            <View className="gap-2">
              <Label nativeID="username">Username</Label>
              <Input
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                aria-labelledby="username"
              />
            </View>

            <View className="gap-2">
              <Label nativeID="permission">Permission</Label>
              <Select
                value={{ value: permission, label: permission === "view" ? "View Only" : "Collaborate" }}
                onValueChange={(option) => setPermission(option?.value as Permission)}
              >
                <SelectTrigger>
                  <SelectValue
                    className="text-foreground text-sm"
                    placeholder="Select permission"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem label="View Only" value="view">
                      View Only
                    </SelectItem>
                    <SelectItem label="Collaborate" value="collaborate">
                      Collaborate
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </View>

            {shares.length > 0 && (
              <View className="border-t border-border pt-4 gap-3">
                <Text className="text-sm font-medium">Current Shares</Text>
                {shares.map((share) => (
                  <View
                    key={share.id}
                    className="flex-row items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <View className="flex-1 gap-2">
                      <Text className="text-sm font-medium">
                        {share.shared_with_user_id}
                      </Text>
                      <Select
                        value={{
                          value: share.permission,
                          label: share.permission === "view" ? "View Only" : "Collaborate",
                        }}
                        onValueChange={(option) =>
                          handleUpdatePermission(share.id, option?.value as Permission)
                        }
                      >
                        <SelectTrigger className="h-8 w-36">
                          <SelectValue className="text-sm" placeholder="Choose share mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem label="View Only" value="view">
                              View Only
                            </SelectItem>
                            <SelectItem label="Collaborate" value="collaborate">
                              Collaborate
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </View>
                    <Button
                      variant="ghost"
                      size="icon"
                      onPress={() => handleRemoveShare(share.id)}
                      disabled={removingShareId === share.id}
                    >
                      <X size={16} className="text-muted-foreground" />
                    </Button>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onPress={() => setOpen(false)}>
              <Text>Cancel</Text>
            </Button>
          </DialogClose>
          <Button onPress={handleShare} disabled={isSubmitting}>
            <Text>{isSubmitting ? "Sharing..." : "Share"}</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
