import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export type UserRole = 'user' | 'seller' | 'admin'

export interface User {
  id: string
  email: string
  password: string
  role: UserRole
  name: string
  avatar?: string
  qualifications?: string
  bio?: string
  skills?: string[]
  experience?: string
  education?: string
  phone?: string
  address?: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthToken {
  userId: string
  email: string
  role: UserRole
}

export function generateToken(user: AuthToken): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): AuthToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthToken
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<AuthToken | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (!token) {
    return null
  }
  
  return verifyToken(token)
}

export async function requireAuth(requiredRole?: UserRole): Promise<AuthToken> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  if (requiredRole && user.role !== requiredRole) {
    throw new Error('Forbidden')
  }
  
  return user
}

