import { NextRequest, NextResponse } from 'next/server'
import { getProductById, updateProduct, createUserNotification } from '@/lib/db'
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

    const product = await getProductById(params.id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Admin can only approve after payment is completed
    if (currentUser.role === 'admin') {
      if (product.status !== 'payment_completed') {
        return NextResponse.json(
          { error: 'Payment must be completed before admin can deliver the project' },
          { status: 400 }
        )
      }
    } else {
      // User can approve if demo is submitted
      if (product.status !== 'demo_submitted') {
        return NextResponse.json(
          { error: 'Demo must be submitted before approval' },
          { status: 400 }
        )
      }
    }

    if (currentUser.role === 'user' && product.userId !== currentUser.userId) {
      return NextResponse.json(
        { error: 'You can only approve your own product demos' },
        { status: 403 }
      )
    }

    const { getUserByEmail } = await import('@/lib/db')
    const userDetails = await getUserByEmail(currentUser.email)
    
    // Update product status
    const updatedProduct = await updateProduct(params.id, {
      status: currentUser.role === 'admin' ? 'delivered' : 'demo_approved',
      demoApprovedBy: userDetails?.name || currentUser.email,
      deliveredAt: currentUser.role === 'admin' ? new Date().toISOString() : product.deliveredAt
    })

    // If admin delivered, notify the user
    if (currentUser.role === 'admin') {
      await createUserNotification({
        userId: product.userId,
        productId: product.id,
        message: `Your project "${product.title}" has been delivered. Thank you for completing the payment!`
      })
    }

    // Notify seller
    if (product.acceptedSellerId) {
      const { getUsers } = await import('@/lib/db')
      const users = await getUsers()
      const seller = users.find(u => u.id === product.acceptedSellerId)
      
      if (seller) {
        const { createNotification } = await import('@/lib/db')
        await createNotification({
          sellerId: seller.id,
          productId: product.id,
          message:
            currentUser.role === 'admin'
              ? `Your project "${product.title}" has been delivered to the user.`
              : `The user approved your demo for "${product.title}". Awaiting admin delivery.`,
          type: 'product_accepted'
        })
      }
    }

    return NextResponse.json({ product: updatedProduct })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

