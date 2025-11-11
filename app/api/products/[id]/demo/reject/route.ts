import { NextRequest, NextResponse } from 'next/server'
import { getProductById, updateProduct, getUsers, createNotification, createUserNotification } from '@/lib/db'
import { requireAuth, getCurrentUser } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (currentUser.role !== 'admin' && currentUser.role !== 'user') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { rejectionReason } = await request.json()
    const product = await getProductById(params.id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (product.status !== 'demo_submitted') {
      return NextResponse.json(
        { error: 'Demo must be submitted before rejection' },
        { status: 400 }
      )
    }

    if (currentUser.role === 'user' && product.userId !== currentUser.userId) {
      return NextResponse.json(
        { error: 'You can only reject your own product demos' },
        { status: 403 }
      )
    }

    const { getUserByEmail } = await import('@/lib/db')
    const userDetails = await getUserByEmail(currentUser.email)
    
    // Reject the demo and reset to approved status to allow next seller
    const updatedProduct = await updateProduct(params.id, {
      status: 'approved',
      demoRejectedBy: userDetails?.name || currentUser.email,
      demoRejectionReason: rejectionReason || 'Not specified',
      acceptedSellerId: null,
      acceptedSellerName: null,
      demoUrl: null,
      demoDescription: null,
      demoSubmittedAt: null
    })

    // Notify the rejected seller
    if (product.acceptedSellerId) {
      const users = await getUsers()
      const seller = users.find(u => u.id === product.acceptedSellerId)
      
      if (seller) {
        await createNotification({
          sellerId: seller.id,
          productId: product.id,
          message: `Your demo for "${product.title}" was rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
          type: 'product_taken'
        })
      }
    }

    // Notify all other sellers that the product is available again
    const users = await getUsers()
    const sellers = users.filter(u => u.role === 'seller' && u.id !== product.acceptedSellerId)
    
    for (const seller of sellers) {
      await createNotification({
        sellerId: seller.id,
        productId: product.id,
        message: `Product "${product.title}" is available again with budget: $${product.adminModifiedBudget || product.originalBudget}`,
        type: 'product_approved'
      })
    }

    return NextResponse.json({ product: updatedProduct })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}






