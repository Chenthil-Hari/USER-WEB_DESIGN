'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()

      if (!response.ok || !data.user) {
        router.push('/')
        return
      }

      if (requiredRole && data.user.role !== requiredRole) {
        router.push('/')
        return
      }

      setIsAuthorized(true)
    } catch (error) {
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}






