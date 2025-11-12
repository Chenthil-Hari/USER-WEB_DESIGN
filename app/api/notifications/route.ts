import { NextRequest, NextResponse } from 'next/server'
import { getNotifications, markNotificationAsRead } from '@/lib/db'
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

    if (user.role === 'seller') {
      // Get user ID from database
      const { getUserByEmail } = await import('@/lib/db')
      const userDetails = await getUserByEmail(user.email)
      
      if (!userDetails) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      const notifications = await getNotifications(userDetails.id)
      return NextResponse.json({ notifications })
    }

    // Admin can see all notifications
    if (user.role === 'admin') {
      const notifications = await getNotifications()
      return NextResponse.json({ notifications })
    }

    return NextResponse.json({ notifications: [] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAuth('seller')
    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    await markNotificationAsRead(notificationId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}







