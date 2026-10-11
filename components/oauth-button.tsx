import { cn } from '@/lib/utils'
import { useSSO } from '@clerk/clerk-expo'
import { OAuthStrategy } from '@clerk/types'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import React, { useCallback, useEffect } from 'react'
import { Platform, TouchableOpacity } from 'react-native'

export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS === 'web') return
    void WebBrowser.warmUpAsync()
    return () => {
      void WebBrowser.coolDownAsync()
    }
  }, [])
}
WebBrowser.maybeCompleteAuthSession()

interface Props {
  // The OAuthStrategy type from Clerk allows you to specify the provider you want to use in this specific instance of the OAuthButton component
  strategy: OAuthStrategy
  children: React.ReactNode
}

export default function OAuthButton({ strategy, children }: Props) {
  useWarmUpBrowser()
  const { startSSOFlow } = useSSO()

  const onPress = useCallback(async () => {
    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'mwh',
        path: 'oauth-native-callback'
      })

      const result = await startSSOFlow({
        strategy,
        redirectUrl,
      })

      if (result.createdSessionId) {
        // Session was created successfully
        await result.setActive!({ session: result.createdSessionId })
      } else if (result.signUp && result.signUp.missingFields?.length > 0) {
        // Need to complete signup with missing fields
        console.log('Missing fields:', result.signUp.missingFields)

        // Update signup with required fields
        await result.signUp.update({
          username: result.signUp.emailAddress?.split('@')[0] || `user_${Date.now()}`,
          legalAccepted: true
        })

        // Try to create the session
        const completeSignUp = await result.signUp.create({
          legalAccepted: true,
          username: result.signUp.emailAddress?.split('@')[0] || `user_${Date.now()}`
        })

        if (completeSignUp.createdSessionId) {
          await result.setActive!({ session: completeSignUp.createdSessionId })
        }
      } else {
        console.log('OAuth flow completed but no session created - user may have cancelled')
      }
    } catch (err: any) {
      console.error('OAuth Error:', err)
      console.error('OAuth Error Details:', err?.errors || err?.message || err)
    }
  }, [startSSOFlow, strategy])

  return (
    <TouchableOpacity onPress={onPress} className={cn(
      "flex flex-row items-center justify-center gap-4",
      "w-1/2 rounded-md px-4 py-3",
      "bg-background active:bg-accent dark:bg-input/30 dark:active:bg-input/50",
      "shadow-sm shadow-black/5",
      "border border-border dark:border-input"
    )}>
      {children}
    </TouchableOpacity>
  )
}
