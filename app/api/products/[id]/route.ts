import { NextRequest, NextResponse } from 'next/server'
import {
  getProductById,
  updateProduct,
  getUsers,
  createNotification,
  createUserNotification,
  getUserByEmail
} from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProductById(params.id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAuth('admin')
    const adminDetails = await getUserByEmail(admin.email)
    const { adminModifiedBudget, status } = await request.json()

    const product = await getProductById(params.id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const updates: any = {}
    
    if (adminModifiedBudget !== undefined) {
      updates.adminModifiedBudget = parseFloat(adminModifiedBudget)
      updates.status = 'approved'
    }
    
    if (status) {
      updates.status = status

      if (status === 'rejected') {
        updates.acceptedSellerId = null
        updates.acceptedSellerName = null
        updates.demoUrl = null
        updates.demoDescription = null
        updates.demoSubmittedAt = null
        updates.demoNotifiedAt = null
        updates.demoApprovedBy = null
        updates.demoRejectedBy = adminDetails?.name || admin.email
        updates.demoRejectionReason = 'Rejected by admin'
        updates.paymentStatus = null
        updates.paymentAmount = null
        updates.paymentDate = null
        updates.paymentTransactionId = null
        updates.deliveredAt = null
      }
    }

    const updatedProduct = await updateProduct(params.id, updates)

    if (status === 'rejected') {
      await createUserNotification({
        userId: product.userId,
        productId: product.id,
        message: `Your project "${product.title}" has been rejected by the admin.`
      })

      if (product.acceptedSellerId) {
        await createNotification({
          sellerId: product.acceptedSellerId,
          productId: product.id,
          message: `The project "${product.title}" has been rejected by the admin.`,
          type: 'product_taken'
        })
      }
    }

    // If admin modified budget, notify all sellers
    if (adminModifiedBudget !== undefined && updates.status === 'approved') {
      const users = await getUsers()
      const sellers = users.filter(u => u.role === 'seller')
      
      for (const seller of sellers) {
        await createNotification({
          sellerId: seller.id,
          productId: product.id,
          message: `New product "${product.title}" is available with budget: $${adminModifiedBudget}`,
          type: 'product_approved'
        })
      }
    }

    return NextResponse.json({ product: updatedProduct })
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

