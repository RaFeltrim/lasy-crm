'use client'

import { useEffect, useState } from 'react'
import { authService, type AuthState } from '@/lib/auth'
import type { Session } from '@supabase/supabase-js'

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  })

  useEffect(() => {
    // Get initial session
    authService.getSession().then((session) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
      })
    })

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      (session: Session | null) => {
        setState({
          user: session?.user ?? null,
          session,
          loading: false,
        })
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true }))
    try {
      await authService.signIn(email, password)
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  const signOut = async () => {
    setState((prev) => ({ ...prev, loading: true }))
    try {
      await authService.signOut()
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  return {
    ...state,
    signIn,
    signOut,
  }
}
