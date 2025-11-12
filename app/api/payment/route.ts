import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getProductById, updateProduct, getUserByEmail, createUserNotification } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth('user')
    const { productId, amount, transactionId } = await request.json()

    if (!productId || !amount) {
      return NextResponse.json(
        { error: 'Product ID and amount are required' },
        { status: 400 }
      )
    }

    const product = await getProductById(productId)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Verify user owns this product
    if (product.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Verify product has demo submitted
    if (product.status !== 'demo_submitted' && product.status !== 'payment_pending') {
      return NextResponse.json(
        { error: 'Demo must be reviewed by admin before payment' },
        { status: 400 }
      )
    }

    // Verify payment amount matches admin modified budget
    if (amount !== product.adminModifiedBudget) {
      return NextResponse.json(
        { error: 'Payment amount does not match project budget' },
        { status: 400 }
      )
    }

    // Update product with payment information
    const updatedProduct = await updateProduct(productId, {
      paymentStatus: 'completed',
      paymentAmount: amount,
      paymentDate: new Date().toISOString(),
      paymentTransactionId: transactionId || `TXN-${Date.now()}`,
      status: 'payment_completed'
    })

    // Notify admin that payment is received
    const adminUsers = await import('@/lib/db').then(m => m.getUsers())
    const admin = adminUsers.find(u => u.role === 'admin')
    
    if (admin) {
      await createUserNotification({
        userId: admin.id,
        productId: productId,
        message: `Payment received for project "${product.title}" from ${user.email}. Amount: $${amount}`
      })
    }

    return NextResponse.json({ 
      success: true,
      product: updatedProduct,
      message: 'Payment processed successfully'
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (productId) {
      const product = await getProductById(productId)
      
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      // Verify user has access to this product
      if (user.role === 'user' && product.userId !== user.userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }

      return NextResponse.json({ 
        paymentStatus: product.paymentStatus,
        paymentAmount: product.paymentAmount,
        paymentDate: product.paymentDate,
        paymentTransactionId: product.paymentTransactionId
      })
    }

    return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
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







