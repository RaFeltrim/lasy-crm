'use client'

import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/AuthProvider'
import { LoginForm } from '@/components/LoginForm'
import { useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const { user, signIn } = useAuthContext()

  useEffect(() => {
    if (user) {
      console.log('User detected, redirecting...', user)
      router.push('/')
      router.refresh()
    }
  }, [user, router])

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password)
      console.log('Sign in successful, forcing redirect...')
      // Force immediate redirect using window.location for reliability
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <LoginForm onSubmit={handleLogin} />
    </div>
  )
}
