import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/db'
import { UserRole } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role, name } = await request.json()

    if (!email || !password || !role || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!['user', 'seller', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const user = await createUser(email, password, role as UserRole, name)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}






