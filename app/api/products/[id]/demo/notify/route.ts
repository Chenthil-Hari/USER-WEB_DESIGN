import { NextRequest, NextResponse } from 'next/server'
import {
  getProductById,
  updateProduct,
  createUserNotification,
  createNotification
} from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth('admin')

    const product = await getProductById(params.id)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (product.status !== 'demo_submitted' && product.status !== 'payment_pending') {
      return NextResponse.json(
        { error: 'Demo must be submitted before notifying the user' },
        { status: 400 }
      )
    }

    const updatedProduct = await updateProduct(params.id, {
      status: 'payment_pending',
      paymentStatus: product.paymentStatus === 'completed' ? product.paymentStatus : 'pending',
      demoNotifiedAt: new Date().toISOString()
    })

    // Notify the user that the demo is ready for review and payment
    const userMessage =
      product.status === 'payment_pending'
        ? `Reminder: Payment is still pending for "${product.title}". Please complete it to receive the final delivery.`
        : `The demo for "${product.title}" is ready. Please review and complete payment to proceed.`

    await createUserNotification({
      userId: product.userId,
      productId: product.id,
      message: userMessage
    })

    // Notify the seller that the user has been informed
    if (product.acceptedSellerId) {
      await createNotification({
        sellerId: product.acceptedSellerId,
        productId: product.id,
        message: `Admin has notified the user about your demo for "${product.title}". Awaiting payment.`,
        type: 'product_accepted'
      })
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


