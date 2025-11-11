import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getUserByEmail, updateUser } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const userDetails = await getUserByEmail(user.email)
    
    if (!userDetails) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = userDetails
    
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth()
    const userDetails = await getUserByEmail(user.email)
    
    if (!userDetails) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const updates = await request.json()
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    const { password, email, role, id, ...safeUpdates } = updates
    
    const updatedUser = await updateUser(userDetails.id, safeUpdates)
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser
    
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}






