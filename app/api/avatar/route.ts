import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { requireAuth } from '@/lib/auth'
import { getUserByEmail, updateUser } from '@/lib/db'

const AVATAR_DIR = path.join(process.cwd(), 'public', 'avatars')

// Ensure avatar directory exists
if (!existsSync(AVATAR_DIR)) {
  await mkdir(AVATAR_DIR, { recursive: true })
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const userDetails = await getUserByEmail(user.email)
    
    if (!userDetails) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name).toLowerCase() || '.jpg'
    const filename = `${userDetails.id}-${timestamp}${fileExtension}`
    const filepath = path.join(AVATAR_DIR, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Update user avatar
    const avatarUrl = `/avatars/${filename}`
    await updateUser(userDetails.id, { avatar: avatarUrl })

    return NextResponse.json({ 
      success: true,
      avatarUrl
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    )
  }
}







