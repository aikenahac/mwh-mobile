import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Text } from './ui/text';
import type { Share } from '@/lib/api/schemas';
import { useUser as useClerkUser } from '@clerk/clerk-expo';

type Props = {
  shares: Share[];
  shareCount: number;
};

// Helper to get user info - in a real app, you'd fetch this from your backend
function useUserInfo(userId: string) {
  // For now, we'll just return the user ID
  // In production, you'd want to fetch user details from your API
  return { username: userId, loading: false };
}

export function ViewSharesDialog({ shares, shareCount }: Props) {
  if (shareCount === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-0">
          <Text className="text-sm text-muted-foreground underline">
            Shared with {shareCount} {shareCount === 1 ? 'person' : 'people'}
          </Text>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shared With</DialogTitle>
          <DialogDescription>
            Users who have access to this deck
          </DialogDescription>
        </DialogHeader>
        <View className="gap-3 py-4">
          {shares.length === 0 ? (
            <Text className="text-muted-foreground text-center">
              Not shared with anyone
            </Text>
          ) : (
            shares.map((share) => (
              <View
                key={share.id}
                className="flex-row items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <View className="flex-1">
                  <Text className="font-medium text-foreground">
                    User ID: {share.shared_with_user_id}
                  </Text>
                  <Text className="text-sm text-muted-foreground capitalize">
                    {share.permission} access
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </DialogContent>
    </Dialog>
  );
}
