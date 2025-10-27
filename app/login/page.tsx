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
      router.push('/')
    }
  }, [user, router])

  const handleLogin = async (email: string, password: string) => {
    await signIn(email, password)
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <LoginForm onSubmit={handleLogin} />
    </div>
  )
}
