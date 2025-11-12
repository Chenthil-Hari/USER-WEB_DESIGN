'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { addNotification } from '@/components/NotificationCenter'

export default function AdminDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [modifiedBudget, setModifiedBudget] = useState('')
  const [updating, setUpdating] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchProducts()
    fetchStats()
    const interval = setInterval(() => {
      fetchProducts()
      fetchStats()
    }, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  async function fetchStats() {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      if (response.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      if (response.ok) {
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateBudget(productId: string) {
    if (!modifiedBudget || parseFloat(modifiedBudget) <= 0) {
      alert('Please enter a valid budget amount')
      return
    }

    setUpdating(true)

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminModifiedBudget: modifiedBudget, status: 'approved' })
      })

      const data = await response.json()

      if (response.ok) {
        setEditingProduct(null)
        setModifiedBudget('')
        fetchProducts()
        fetchStats()
        addNotification('Budget updated and sellers notified!', 'success')
      } else {
        addNotification(data.error || 'Failed to update budget', 'error')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  async function handleReject(productId: string) {
    if (!confirm('Are you sure you want to reject this product?')) {
      return
    }

    setActionLoading(productId)

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      })

      if (response.ok) {
        fetchProducts()
        fetchStats()
        addNotification('Product rejected', 'info')
      } else {
        addNotification('Failed to reject product', 'error')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleNotifyUser(productId: string) {
    setActionLoading(productId)
    try {
      const response = await fetch(`/api/products/${productId}/demo/notify`, {
        method: 'POST'
      })
      const data = await response.json()
      if (response.ok) {
        addNotification('User notified about the demo!', 'success')
        fetchProducts()
        fetchStats()
      } else {
        addNotification(data.error || 'Failed to notify user', 'error')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDeliver(productId: string) {
    setActionLoading(productId)
    try {
      const response = await fetch(`/api/products/${productId}/demo/approve`, {
        method: 'POST'
      })
      const data = await response.json()
      if (response.ok) {
        addNotification('Project delivered to the user!', 'success')
        fetchProducts()
        fetchStats()
      } else {
        addNotification(data.error || 'Failed to deliver project', 'error')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      router.push('/')
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </ProtectedRoute>
    )
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.userName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const pendingProducts = filteredProducts.filter(p => p.status === 'pending')
  const approvedProducts = filteredProducts.filter(p => p.status === 'approved')
  const rejectedProducts = filteredProducts.filter(p => p.status === 'rejected')

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-pattern-purple relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20"></div>
        <nav className="bg-purple-600/90 backdrop-blur-md text-white p-4 shadow-xl relative z-10">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </nav>

        <div className="container mx-auto p-6 relative z-10">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <div className="glass p-4 rounded-xl shadow-lg hover-lift">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Products</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.totalProducts}</p>
              </div>
              <div className="glass p-4 rounded-xl shadow-lg hover-lift bg-yellow-50">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Pending</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingProducts}</p>
              </div>
              <div className="glass p-4 rounded-xl shadow-lg hover-lift bg-green-50">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Approved</h3>
                <p className="text-3xl font-bold text-green-600">{stats.approvedProducts}</p>
              </div>
              <div className="glass p-4 rounded-xl shadow-lg hover-lift bg-blue-50">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Accepted</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.acceptedProducts}</p>
              </div>
              <div className="glass p-4 rounded-xl shadow-lg hover-lift bg-indigo-50">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Demos Submitted</h3>
                <p className="text-3xl font-bold text-indigo-600">{stats.demoSubmitted}</p>
              </div>
              <div className="glass p-4 rounded-xl shadow-lg hover-lift bg-orange-50">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Awaiting Payment</h3>
                <p className="text-3xl font-bold text-orange-600">{stats.paymentPending}</p>
              </div>
              <div className="glass p-4 rounded-xl shadow-lg hover-lift bg-purple-50">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Payments Received</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.paymentCompleted}</p>
              </div>
              <div className="glass p-4 rounded-xl shadow-lg hover-lift bg-emerald-50">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Delivered</h3>
                <p className="text-3xl font-bold text-emerald-600">{stats.delivered}</p>
              </div>
              <div className="glass p-4 rounded-xl shadow-lg hover-lift bg-pink-50">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Budget</h3>
                <p className="text-2xl font-bold text-pink-600">${stats.totalBudget.toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="mb-6 flex gap-4 items-center">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 glass px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="glass px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="accepted">Accepted</option>
              <option value="demo_submitted">Demo Submitted</option>
              <option value="payment_pending">Awaiting Payment</option>
              <option value="payment_completed">Payment Received</option>
              <option value="demo_approved">Demo Approved</option>
              <option value="delivered">Delivered</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-white drop-shadow-lg">Pending Products ({pendingProducts.length})</h2>
            {pendingProducts.length === 0 ? (
              <div className="glass p-6 rounded-xl shadow-lg text-center text-gray-500">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop" alt="No products" className="w-32 h-32 mx-auto mb-4 rounded-full opacity-50" />
                No pending products
              </div>
            ) : (
              <div className="space-y-4">
                {pendingProducts.map((product) => (
                  <div key={product.id} className="glass p-6 rounded-xl shadow-lg hover-lift animate-fadeIn">
                    <h3 className="text-xl font-bold mb-2 text-gray-100">{product.title}</h3>
                    <p className="text-gray-300 mb-2 font-medium">{product.description}</p>
                    <div className="mb-4">
                      <p className="text-sm text-gray-300 font-semibold">
                        User: <span className="text-gray-100">{product.userName}</span> <span className="text-gray-400">({product.userEmail})</span>
                      </p>
                      <p className="text-sm text-gray-300 mt-1 font-semibold">
                        Original Budget: <span className="font-bold text-blue-400">${product.originalBudget}</span>
                      </p>
                    </div>
                    
                    {editingProduct === product.id ? (
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-gray-200 mb-1">
                            Modified Budget ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={modifiedBudget}
                            onChange={(e) => setModifiedBudget(e.target.value)}
                            min="0"
                            className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-100 placeholder-gray-500 font-medium"
                          />
                        </div>
                        <button
                          onClick={() => handleUpdateBudget(product.id)}
                          disabled={updating}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {updating ? 'Updating...' : 'Approve & Notify'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(null)
                            setModifiedBudget('')
                          }}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product.id)
                            setModifiedBudget(product.originalBudget.toString())
                          }}
                          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                        >
                          Modify Budget & Approve
                        </button>
                        <button
                          onClick={() => handleReject(product.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Submitted: {new Date(product.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-white drop-shadow-lg">All Products ({filteredProducts.length})</h2>
            {filteredProducts.length === 0 ? (
              <div className="glass p-6 rounded-xl shadow-lg text-center text-gray-500">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop" alt="No products" className="w-32 h-32 mx-auto mb-4 rounded-full opacity-50" />
                No products found
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="glass p-6 rounded-xl shadow-lg hover-lift animate-fadeIn">
                    <h3 className="text-xl font-bold mb-2 text-gray-100">{product.title}</h3>
                    <p className="text-gray-300 mb-2 font-medium">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-300 font-semibold">
                          User: <span className="text-gray-100">{product.userName}</span> <span className="text-gray-400">({product.userEmail})</span>
                        </p>
                        <p className="text-sm text-gray-300 mt-1 font-semibold">
                          Original Budget: <span className="font-bold text-blue-400">${product.originalBudget}</span>
                        </p>
                        {product.adminModifiedBudget && (
                          <p className="text-sm text-green-400 mt-1 font-semibold">
                            Modified Budget: <span className="font-bold text-green-500">${product.adminModifiedBudget}</span>
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          product.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'accepted'
                            ? 'bg-blue-100 text-blue-800'
                            : product.status === 'demo_submitted'
                            ? 'bg-yellow-100 text-yellow-800'
                            : product.status === 'payment_pending'
                            ? 'bg-orange-100 text-orange-800'
                            : product.status === 'payment_completed'
                            ? 'bg-purple-100 text-purple-800'
                            : product.status === 'demo_approved'
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : product.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {{
                          pending: 'Pending',
                          approved: 'Approved',
                          accepted: 'Accepted',
                          demo_submitted: 'Demo Submitted',
                          payment_pending: 'Awaiting Payment',
                          payment_completed: 'Payment Received',
                          demo_approved: 'Demo Approved',
                          delivered: 'Delivered',
                          rejected: 'Rejected'
                        }[product.status] || product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </span>
                    </div>
                    {product.acceptedSellerName && (
                      <p className="text-sm text-blue-600 mt-2">
                        Accepted by: <span className="font-semibold">{product.acceptedSellerName}</span>
                      </p>
                    )}
                    {['approved', 'accepted', 'payment_pending', 'demo_approved', 'delivered'].includes(product.status) && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleReject(product.id)}
                          disabled={actionLoading === product.id}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm disabled:opacity-60"
                        >
                          {actionLoading === product.id ? 'Processing...' : 'Reject Project'}
                        </button>
                      </div>
                    )}
                    {product.status === 'demo_submitted' && product.demoUrl && (
                      <div className="mt-4 pt-4 border-t bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 text-gray-100">Demo Submitted by {product.acceptedSellerName}</h4>
                        <div className="mb-3">
                          <a 
                            href={product.demoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline font-medium"
                          >
                            View Demo →
                          </a>
                        </div>
                        {product.demoDescription && (
                          <p className="text-sm text-gray-300 mb-3 font-medium">{product.demoDescription}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleNotifyUser(product.id)}
                            disabled={actionLoading === product.id}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60"
                          >
                            {actionLoading === product.id ? 'Notifying...' : 'Notify User'}
                          </button>
                          <button
                            onClick={async () => {
                              const reason = prompt('Please provide a reason for rejection (optional):')
                              try {
                                const response = await fetch(`/api/products/${product.id}/demo/reject`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ rejectionReason: reason || '' })
                                })
                                if (response.ok) {
                                  addNotification('Demo rejected. Product will be available for next seller.', 'info')
                                  fetchProducts()
                                  fetchStats()
                                } else {
                                  const data = await response.json()
                                  addNotification(data.error || 'Failed to reject demo', 'error')
                                }
                              } catch (error) {
                                alert('An error occurred')
                              }
                            }}
                            disabled={actionLoading === product.id}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-60"
                          >
                            ✗ Reject Demo
                          </button>
                        </div>
                      </div>
                    )}
                    {product.status === 'payment_pending' && product.demoUrl && (
                      <div className="mt-4 pt-4 border-t bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-orange-500 mb-2">Awaiting Payment</h4>
                        <p className="text-sm text-gray-300 mb-3 font-medium">
                          The user has been notified. Waiting for payment confirmation.
                        </p>
                        <button
                          onClick={() => handleNotifyUser(product.id)}
                          disabled={actionLoading === product.id}
                          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-60"
                        >
                          {actionLoading === product.id ? 'Sending Reminder...' : 'Send Reminder'}
                        </button>
                      </div>
                    )}
                    {product.status === 'payment_completed' && (
                      <div className="mt-4 pt-4 border-t bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-500 mb-2">Payment Verified</h4>
                        <p className="text-sm text-gray-300 mb-3 font-medium">
                          Payment received from {product.userName}. Deliver the final project to complete.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeliver(product.id)}
                            disabled={actionLoading === product.id}
                            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-60"
                          >
                            {actionLoading === product.id ? 'Delivering...' : 'Deliver Project'}
                          </button>
                          <button
                            onClick={() => handleReject(product.id)}
                            disabled={actionLoading === product.id}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                    {product.status === 'demo_approved' && product.demoUrl && (
                      <div className="mt-4 pt-4 border-t bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-400 mb-2">✓ Demo Approved!</h4>
                        <a 
                          href={product.demoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline"
                        >
                          View Final Demo →
                        </a>
                      </div>
                    )}
                    {product.status === 'delivered' && product.demoUrl && (
                      <div className="mt-4 pt-4 border-t bg-emerald-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-emerald-500 mb-2">🎉 Project Delivered</h4>
                        <p className="text-sm text-gray-300 mb-3 font-medium">
                          Final delivery sent to the user. Great job!
                        </p>
                        <a 
                          href={product.demoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline"
                        >
                          View Delivery →
                        </a>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Submitted: {new Date(product.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

