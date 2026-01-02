'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { canBookDinners, getAccessDeniedMessage, getRoleBasedRedirect } from '../../lib/access-control'
import { Alert, AlertDescription } from '../ui/alert'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '../ui/button'
import { useAuth } from '@/contexts/auth-context'
//add types
interface BookingGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function BookingGuard({ children, fallback }: BookingGuardProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) {
      return
    }

    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }

    if (user && !canBookDinners(user)) {
      const redirectUrl = getRoleBasedRedirect(user)
      router.push(redirectUrl)
    }
  }, [user, loading, isAuthenticated, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show fallback if user cannot book
  if (user && !canBookDinners(user)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              {getAccessDeniedMessage(user)}
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Button 
              onClick={() => router.push(getRoleBasedRedirect(user))}
              variant="outline"
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show children if user is authenticated and can book
  if (isAuthenticated && user && canBookDinners(user)) {
    return <>{children}</>
  }

  // If not authenticated, show loading (will redirect in useEffect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  // Fallback for any other case
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
