'use client'

import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/AuthProvider'
import { RegisterForm } from '@/components/RegisterForm'
import { useEffect } from 'react'
import { authService } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const { user } = useAuthContext()

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleRegister = async (email: string, password: string) => {
    const result = await authService.signUp(email, password)
    // If email confirmation is disabled, user will be logged in automatically
    // Otherwise, redirect to login
    if (result.session) {
      // User is logged in, useEffect will redirect to home
    } else {
      // Email confirmation required, redirect to login
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <RegisterForm onSubmit={handleRegister} />
    </div>
  )
}
