import { NextRequest, NextResponse } from 'next/server'
import { getProducts, createProduct, getProductById } from '@/lib/db'
import { requireAuth, getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const products = await getProducts()

    // Filter products based on role
    if (user.role === 'user') {
      // Users can only see their own products
      return NextResponse.json({
        products: products.filter(p => p.userId === user.userId)
      })
    } else if (user.role === 'seller') {
      // Sellers can see approved products (not yet accepted) or their own accepted products
      const { getUserByEmail } = await import('@/lib/db')
      const userDetails = await getUserByEmail(user.email)
      
      if (!userDetails) {
        return NextResponse.json({ products: [] })
      }

      const sellerProducts = products.filter(p => {
        // Show approved products not yet accepted
        if (p.status === 'approved' && !p.acceptedSellerId) {
          return true
        }
        // Show products accepted by this seller
        if (p.acceptedSellerId === userDetails.id) {
          return true
        }
        return false
      })

      // Remove user details from products for sellers
      const sanitizedProducts = sellerProducts.map(p => ({
        ...p,
        userName: 'Client',
        userEmail: 'hidden@example.com'
      }))

      return NextResponse.json({ products: sanitizedProducts })
    } else if (user.role === 'admin') {
      // Admin can see all products
      return NextResponse.json({ products })
    }

    return NextResponse.json({ products: [] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth('user')
    const { title, description, originalBudget } = await request.json()

    if (!title || !description || !originalBudget) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Get user details
    const { getUserByEmail } = await import('@/lib/db')
    const userDetails = await getUserByEmail(user.email)
    
    if (!userDetails) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const product = await createProduct({
      userId: user.userId,
      userName: userDetails.name,
      userEmail: user.email,
      title,
      description,
      originalBudget: parseFloat(originalBudget)
    })

    return NextResponse.json({ product }, { status: 201 })
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

