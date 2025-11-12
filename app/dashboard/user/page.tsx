'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { addNotification } from '@/components/NotificationCenter'

export default function UserDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showNotifications, setShowNotifications] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    originalBudget: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchNotifications()
    // Poll for new notifications every 5 seconds
    const interval = setInterval(fetchNotifications, 5000)
    return () => clearInterval(interval)
  }, [])

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

  async function fetchNotifications() {
    try {
      const response = await fetch('/api/user-notifications')
      const data = await response.json()
      if (response.ok) {
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setFormData({ title: '', description: '', originalBudget: '' })
        setShowForm(false)
        fetchProducts()
        addNotification('Product submitted successfully!', 'success')
      } else {
        addNotification(data.error || 'Failed to submit product', 'error')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
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
      <ProtectedRoute requiredRole="user">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </ProtectedRoute>
    )
  }

  // Calculate user statistics
  const totalProjects = products.length
  const pendingProjects = products.filter(p => p.status === 'pending').length
  const activeStatuses = ['approved', 'accepted', 'demo_submitted', 'payment_pending', 'payment_completed', 'demo_approved', 'delivered']
  const activeProjects = products.filter(p => activeStatuses.includes(p.status)).length
  const completedProjects = products.filter(p => p.status === 'delivered').length
  const totalBudget = products.reduce((sum, p) => sum + (p.originalBudget || 0), 0)
  const spentBudget = products
    .filter(p => p.status === 'payment_completed' || p.status === 'delivered')
    .reduce((sum, p) => sum + (p.adminModifiedBudget || p.originalBudget || 0), 0)
  const projectsWithSellers = products.filter(p => p.acceptedSellerName)

  return (
    <ProtectedRoute requiredRole="user">
      <div className="min-h-screen bg-pattern-blue relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-cyan-900/20"></div>
        <nav className="bg-blue-600/90 backdrop-blur-md text-white p-4 shadow-xl relative z-10">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" 
                alt="Profile" 
                className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold">User Dashboard</h1>
                <p className="text-sm text-blue-100">Manage your projects efficiently 🚀</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                🔔 Notifications
                {notifications.filter((n: any) => !n.read).length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                    {notifications.filter((n: any) => !n.read).length}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto p-6 relative z-10">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass p-6 rounded-2xl shadow-xl hover-lift bg-gradient-to-br from-blue-400 to-indigo-500 text-white animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📋</div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Total Projects</p>
                  <p className="text-3xl font-bold">{totalProjects}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <span>Active: {activeProjects}</span>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl shadow-xl hover-lift bg-gradient-to-br from-green-400 to-emerald-500 text-white animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">✅</div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Completed</p>
                  <p className="text-3xl font-bold">{completedProjects}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <span>Pending: {pendingProjects}</span>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl shadow-xl hover-lift bg-gradient-to-br from-purple-400 to-pink-500 text-white animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">💰</div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Budget Spent</p>
                  <p className="text-3xl font-bold">${spentBudget.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <span>Total: ${totalBudget.toLocaleString()}</span>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl shadow-xl hover-lift bg-gradient-to-br from-yellow-400 to-orange-500 text-white animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">👥</div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Active Sellers</p>
                  <p className="text-3xl font-bold">{projectsWithSellers.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <span>Working on projects</span>
              </div>
            </div>
          </div>

          {/* Project Timeline */}
          {products.length > 0 && (
            <div className="mb-8 glass p-6 rounded-2xl shadow-xl animate-fadeIn">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-100">
                <span>📈</span>
                <span>Project Timeline</span>
              </h2>
              <div className="space-y-4">
                {products.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl hover-lift border border-gray-700">
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                        product.status === 'demo_approved' ? 'bg-green-500' :
                        product.status === 'demo_submitted' ? 'bg-yellow-500' :
                        product.status === 'accepted' ? 'bg-blue-500' :
                        product.status === 'approved' ? 'bg-indigo-500' :
                        'bg-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      {index < products.slice(0, 5).length - 1 && (
                        <div className="w-0.5 h-16 bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1 text-gray-100">{product.title}</h3>
                      <p className="text-sm text-gray-300 mb-2 font-medium">{product.description.substring(0, 100)}...</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full font-semibold ${
                            product.status === 'demo_submitted'
                              ? 'bg-yellow-100 text-yellow-800'
                              : product.status === 'payment_pending'
                              ? 'bg-orange-100 text-orange-800'
                              : product.status === 'payment_completed'
                              ? 'bg-purple-100 text-purple-800'
                              : product.status === 'demo_approved'
                              ? 'bg-green-100 text-green-800'
                              : product.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : product.status === 'accepted'
                              ? 'bg-blue-100 text-blue-800'
                              : product.status === 'approved'
                              ? 'bg-indigo-100 text-indigo-800'
                              : product.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {{
                            pending: 'Pending',
                            approved: 'Approved',
                            accepted: 'Accepted',
                            demo_submitted: 'Demo Submitted',
                            payment_pending: 'Awaiting Payment',
                            payment_completed: 'Payment Received',
                            demo_approved: 'User Approved',
                            delivered: 'Delivered',
                            rejected: 'Rejected'
                          }[product.status] || product.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {product.acceptedSellerName && (
                          <span className="text-gray-300 font-medium">👤 {product.acceptedSellerName}</span>
                        )}
                        <span className="text-gray-400 font-medium">{new Date(product.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {showNotifications && notifications.length > 0 && (
            <div className="mb-6 glass p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-gray-100">Notifications</h2>
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.read
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <p className="text-gray-100 font-semibold">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
            >
              <span className="text-xl">{showForm ? '✕' : '+'}</span>
              <span>{showForm ? 'Cancel' : 'Submit New Product'}</span>
            </button>
          </div>

          {showForm && (
            <div className="glass p-8 rounded-2xl shadow-xl mb-6 animate-fadeIn border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">🚀</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-100">Submit Product Details</h2>
                  <p className="text-gray-300 text-sm font-medium">Fill in the form below to submit your project</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-1">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalBudget}
                    onChange={(e) => setFormData({ ...formData, originalBudget: e.target.value })}
                    required
                    min="0"
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-500 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Product'}
                </button>
              </form>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-100">
              <span>📦</span>
              <span>My Products ({products.length})</span>
            </h2>
            {products.length === 0 ? (
              <div className="glass p-6 rounded-xl shadow-lg text-center text-gray-500">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop" alt="No products" className="w-32 h-32 mx-auto mb-4 rounded-full opacity-50" />
                No products submitted yet. Submit your first product above!
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="glass p-6 rounded-2xl shadow-xl hover-lift animate-fadeIn border-2 border-blue-100">
                    <div className="flex items-start gap-4 mb-4">
                      <img 
                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=150&fit=crop" 
                        alt={product.title}
                        className="w-32 h-24 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 text-gray-100">{product.title}</h3>
                        <p className="text-gray-300 mb-2 line-clamp-2 font-medium">{product.description}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-300 font-semibold">
                          Original Budget: <span className="font-bold text-blue-400">${product.originalBudget}</span>
                        </p>
                        {product.acceptedSellerName && (
                          <p className="text-sm text-green-600 mt-1">
                            Accepted by: <span className="font-semibold">{product.acceptedSellerName}</span>
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
                          demo_approved: 'User Approved',
                          delivered: 'Delivered',
                          rejected: 'Rejected'
                        }[product.status] || product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </span>
                    </div>
                    {['demo_submitted', 'payment_pending', 'payment_completed'].includes(product.status) && product.demoUrl && (
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
                        {product.status === 'demo_submitted' && (
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/products/${product.id}/demo/approve`, {
                                    method: 'POST'
                                  })
                                  if (response.ok) {
                                    addNotification('Demo approved!', 'success')
                                    fetchProducts()
                                  } else {
                                    const data = await response.json()
                                    addNotification(data.error || 'Failed to approve demo', 'error')
                                  }
                                } catch (error) {
                                  alert('An error occurred')
                                }
                              }}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                              ✓ Approve Demo
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
                                  } else {
                                    const data = await response.json()
                                    addNotification(data.error || 'Failed to reject demo', 'error')
                                  }
                                } catch (error) {
                                  alert('An error occurred')
                                }
                              }}
                              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                            >
                              ✗ Reject Demo
                            </button>
                          </div>
                        )}
                        {product.status === 'payment_pending' && (
                          <p className="text-sm text-orange-600 font-semibold mt-3">
                            Admin has reviewed the demo. Please complete the payment to proceed.
                          </p>
                        )}
                        {product.status === 'payment_completed' && (
                          <p className="text-sm text-purple-600 font-semibold mt-3">
                            Payment received. Admin will deliver the final project shortly.
                          </p>
                        )}
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
                        <h4 className="font-semibold text-emerald-500 mb-2">🎉 Project Delivered!</h4>
                        <a 
                          href={product.demoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline"
                        >
                          View Delivery →
                        </a>
                        {product.deliveredAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Delivered on {new Date(product.deliveredAt).toLocaleString()}
                          </p>
                        )}
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

