import { NextRequest, NextResponse } from 'next/server'
import { getUserNotifications } from '@/lib/db'
import { requireAuth, getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.role !== 'user') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get user ID from database
    const { getUserByEmail } = await import('@/lib/db')
    const userDetails = await getUserByEmail(user.email)
    
    if (!userDetails) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const notifications = await getUserNotifications(userDetails.id)
    return NextResponse.json({ notifications })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}







