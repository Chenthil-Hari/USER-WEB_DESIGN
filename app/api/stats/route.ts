import { NextRequest, NextResponse } from 'next/server'
import { getProducts, getUsers, getNotifications } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAuth('admin')
    
    const products = await getProducts()
    const users = await getUsers()
    const notifications = await getNotifications()

    const stats = {
      totalProducts: products.length,
      pendingProducts: products.filter(p => p.status === 'pending').length,
      approvedProducts: products.filter(p => p.status === 'approved').length,
      acceptedProducts: products.filter(p => p.status === 'accepted').length,
      demoSubmitted: products.filter(p => p.status === 'demo_submitted').length,
      paymentPending: products.filter(p => p.status === 'payment_pending').length,
      paymentCompleted: products.filter(p => p.status === 'payment_completed').length,
      demoApproved: products.filter(p => p.status === 'demo_approved').length,
      delivered: products.filter(p => p.status === 'delivered').length,
      totalUsers: users.filter(u => u.role === 'user').length,
      totalSellers: users.filter(u => u.role === 'seller').length,
      totalNotifications: notifications.length,
      totalBudget: products.reduce((sum, p) => sum + (p.adminModifiedBudget || p.originalBudget || 0), 0),
      averageBudget: products.length > 0 
        ? products.reduce((sum, p) => sum + (p.adminModifiedBudget || p.originalBudget || 0), 0) / products.length 
        : 0
    }

    return NextResponse.json({ stats })
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







