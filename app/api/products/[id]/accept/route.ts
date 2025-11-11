import { NextRequest, NextResponse } from 'next/server'
import { getProductById, updateProduct, getUsers } from '@/lib/db'
import { createNotification, createUserNotification } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let seller
    try {
      seller = await requireAuth('seller')
    } catch (authError: any) {
      return NextResponse.json(
        { error: authError.message || 'Unauthorized' },
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

    if (product.status !== 'approved') {
      return NextResponse.json(
        { error: 'Product is not available for acceptance' },
        { status: 400 }
      )
    }

    if (product.acceptedSellerId) {
      // Product already accepted by another seller
      // Get seller details
      const { getUserByEmail } = await import('@/lib/db')
      const sellerDetails = await getUserByEmail(seller.email)
      
      if (sellerDetails) {
        await createNotification({
          sellerId: sellerDetails.id,
          productId: product.id,
          message: `Sorry, the product "${product.title}" has already been taken by another seller.`,
          type: 'product_taken'
        })
      }

      return NextResponse.json(
        { error: 'Product has already been accepted by another seller' },
        { status: 409 }
      )
    }

    // Get seller details
    const { getUserByEmail } = await import('@/lib/db')
    const sellerDetails = await getUserByEmail(seller.email)
    
    if (!sellerDetails) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    // Accept the product - use sellerDetails.id (from database) not seller.userId (from token)
    const updatedProduct = await updateProduct(params.id, {
      status: 'accepted',
      acceptedSellerId: sellerDetails.id,
      acceptedSellerName: sellerDetails.name
    })

    // Notify the user
    await createUserNotification({
      userId: product.userId,
      productId: product.id,
      message: `Your product "${product.title}" has been accepted by ${sellerDetails.name}`
    })

    // Notify all other sellers that the product is taken
    const users = await getUsers()
    const otherSellers = users.filter(u => u.role === 'seller' && u.id !== sellerDetails.id)
    
    const { getNotifications } = await import('@/lib/db')
    
    for (const otherSeller of otherSellers) {
      // Check if this seller has a notification for this product
      const notifications = await getNotifications(otherSeller.id)
      const hasNotification = notifications.some((n: any) => n.productId === product.id && (n.type === 'product_approved' || !n.type))
      
      if (hasNotification) {
        await createNotification({
          sellerId: otherSeller.id,
          productId: product.id,
          message: `Sorry, the product "${product.title}" has already been taken by another seller.`,
          type: 'product_taken'
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

