import { NextRequest, NextResponse } from 'next/server'
import { getNotifications, getUserNotifications } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

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
      const { getUserByEmail } = await import('@/lib/db')
      const userDetails = await getUserByEmail(user.email)
      
      if (!userDetails) {
        return NextResponse.json({ notifications: [] })
      }

      const notifications = await getNotifications(userDetails.id)
      const unreadCount = notifications.filter(n => !n.read).length
      
      return NextResponse.json({ 
        notifications: notifications.slice(0, 10),
        unreadCount 
      })
    }

    if (user.role === 'user') {
      const { getUserByEmail } = await import('@/lib/db')
      const userDetails = await getUserByEmail(user.email)
      
      if (!userDetails) {
        return NextResponse.json({ notifications: [] })
      }

      const notifications = await getUserNotifications(userDetails.id)
      const unreadCount = notifications.filter(n => !n.read).length
      
      return NextResponse.json({ 
        notifications: notifications.slice(0, 10),
        unreadCount 
      })
    }

    return NextResponse.json({ notifications: [], unreadCount: 0 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}







