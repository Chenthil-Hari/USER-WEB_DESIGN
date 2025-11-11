import { NextRequest, NextResponse } from 'next/server'
import { getProductById, updateProduct } from '@/lib/db'
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

    const { demoUrl, demoDescription } = await request.json()

    if (!demoUrl) {
      return NextResponse.json(
        { error: 'Demo URL is required' },
        { status: 400 }
      )
    }

    const product = await getProductById(params.id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get seller details to match IDs correctly
    const { getUserByEmail } = await import('@/lib/db')
    const sellerDetails = await getUserByEmail(seller.email)
    
    if (!sellerDetails) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    if (product.acceptedSellerId !== sellerDetails.id) {
      return NextResponse.json(
        { error: 'You are not authorized to submit demo for this product' },
        { status: 403 }
      )
    }

    if (product.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Product must be accepted before submitting demo' },
        { status: 400 }
      )
    }

    const updatedProduct = await updateProduct(params.id, {
      demoUrl,
      demoDescription: demoDescription || null,
      demoSubmittedAt: new Date().toISOString(),
      status: 'demo_submitted'
    })

    return NextResponse.json({ product: updatedProduct })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

