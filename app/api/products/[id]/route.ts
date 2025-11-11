import { NextRequest, NextResponse } from 'next/server'
import { getProductById, updateProduct } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { getUsers } from '@/lib/db'
import { createNotification } from '@/lib/db'

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
    }

    const updatedProduct = await updateProduct(params.id, updates)

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

