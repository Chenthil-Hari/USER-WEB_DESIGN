'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { addNotification } from '@/components/NotificationCenter'

export default function SellerDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(true)
  const [showDemoForm, setShowDemoForm] = useState<string | null>(null)
  const [demoData, setDemoData] = useState({ url: '', description: '', file: null as File | null })
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url')
  const [uploading, setUploading] = useState(false)

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
      const response = await fetch('/api/notifications')
      const data = await response.json()
      if (response.ok) {
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  async function handleAccept(productId: string) {
    try {
      const response = await fetch(`/api/products/${productId}/accept`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        addNotification('Product accepted successfully!', 'success')
        fetchProducts()
        fetchNotifications()
      } else {
        addNotification(data.error || 'Failed to accept product', 'error')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    }
  }

  async function handleReject(notificationId: string, productId: string) {
    try {
      await markAsRead(notificationId)
      alert('Product rejected')
    } catch (error) {
      alert('An error occurred. Please try again.')
    }
  }

  async function handleSubmitDemo(productId: string) {
    if (uploadType === 'url' && !demoData.url) {
      addNotification('Please enter a demo URL', 'error')
      return
    }

    if (uploadType === 'file' && !demoData.file) {
      addNotification('Please select a file to upload', 'error')
      return
    }

    setUploading(true)

    try {
      let demoUrl = demoData.url

      // Handle file upload
      if (uploadType === 'file' && demoData.file) {
        const formData = new FormData()
        formData.append('file', demoData.file)
        formData.append('productId', productId)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        const uploadData = await uploadResponse.json()

        if (!uploadResponse.ok) {
          addNotification(uploadData.error || 'File upload failed', 'error')
          setUploading(false)
          return
        }

        demoUrl = uploadData.fileUrl
      }

      // Submit demo
      const response = await fetch(`/api/products/${productId}/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoUrl,
          demoDescription: demoData.description
        })
      })

      const data = await response.json()

      if (response.ok) {
        addNotification('Demo submitted successfully!', 'success')
        setShowDemoForm(null)
        setDemoData({ url: '', description: '', file: null })
        setUploadType('url')
        fetchProducts()
      } else {
        addNotification(data.error || 'Failed to submit demo', 'error')
      }
    } catch (error) {
      addNotification('An error occurred. Please try again.', 'error')
    } finally {
      setUploading(false)
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
      <ProtectedRoute requiredRole="seller">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </ProtectedRoute>
    )
  }

  const unreadNotifications = notifications.filter(n => !n.read).length
  
  // Calculate seller statistics
  const acceptedProducts = products.filter(p => p.status === 'accepted' || p.status === 'demo_submitted' || p.status === 'demo_approved')
  const completedProducts = products.filter(p => p.status === 'demo_approved')
  const totalEarnings = acceptedProducts.reduce((sum, p) => sum + (p.adminModifiedBudget || 0), 0)
  const pendingEarnings = products.filter(p => p.status === 'demo_submitted').reduce((sum, p) => sum + (p.adminModifiedBudget || 0), 0)
  const completionRate = acceptedProducts.length > 0 ? Math.round((completedProducts.length / acceptedProducts.length) * 100) : 0

  return (
    <ProtectedRoute requiredRole="seller">
      <div className="min-h-screen bg-pattern-green relative">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-emerald-900/20"></div>
        <nav className="bg-green-600/90 backdrop-blur-md text-white p-4 shadow-xl relative z-10">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" 
                alt="Profile" 
                className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold">Seller Dashboard</h1>
                <p className="text-sm text-green-100">Welcome back! 🎉</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                🔔 Notifications
                {unreadNotifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto p-6 relative z-10">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass p-6 rounded-2xl shadow-xl hover-lift bg-gradient-to-br from-green-400 to-emerald-500 text-white animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">💰</div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Total Earnings</p>
                  <p className="text-3xl font-bold">${totalEarnings.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <span>Pending: ${pendingEarnings.toLocaleString()}</span>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl shadow-xl hover-lift bg-gradient-to-br from-blue-400 to-indigo-500 text-white animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📊</div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Active Projects</p>
                  <p className="text-3xl font-bold">{acceptedProducts.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <span>Completed: {completedProducts.length}</span>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl shadow-xl hover-lift bg-gradient-to-br from-purple-400 to-pink-500 text-white animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">✅</div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Completion Rate</p>
                  <p className="text-3xl font-bold">{completionRate}%</p>
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500" 
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl shadow-xl hover-lift bg-gradient-to-br from-yellow-400 to-orange-500 text-white animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">🎯</div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Portfolio Items</p>
                  <p className="text-3xl font-bold">{completedProducts.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <span>Demos submitted</span>
              </div>
            </div>
          </div>

          {/* Portfolio Section */}
          {completedProducts.length > 0 && (
            <div className="mb-8 glass p-6 rounded-2xl shadow-xl animate-fadeIn">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-100">
                <span>🎨</span>
                <span>My Portfolio</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedProducts.map((product) => (
                  <div key={product.id} className="bg-gray-800/50 p-4 rounded-xl hover-lift border-2 border-green-500/30">
                    <img 
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop" 
                      alt={product.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-bold text-lg mb-1 text-gray-100">{product.title}</h3>
                    <p className="text-sm text-gray-300 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-bold">${product.adminModifiedBudget || 0}</span>
                      {product.demoUrl && (
                        <a 
                          href={product.demoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Demo →
                        </a>
                      )}
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
                      notification.read || notification.type === 'product_taken'
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <p className="text-gray-100 font-medium">{notification.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                      {!notification.read && notification.type === 'product_approved' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccept(notification.productId)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(notification.id, notification.productId)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {notification.type === 'product_taken' && (
                        <span className="text-xs text-red-600 font-semibold">Already Taken</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-100">Available Products</h2>
            {products.length === 0 ? (
              <div className="glass p-6 rounded-xl shadow-lg text-center text-gray-500">
                <img src="https://images.unsplash.com/photo-1559028012-481c04fa702d?w=200&h=200&fit=crop" alt="No products" className="w-32 h-32 mx-auto mb-4 rounded-full opacity-50" />
                No approved products available yet. You will be notified when new products are approved.
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="glass p-6 rounded-xl shadow-lg hover-lift animate-fadeIn">
                    <h3 className="text-xl font-bold mb-2 text-gray-100">{product.title}</h3>
                    <p className="text-gray-300 mb-2 font-medium">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        {product.adminModifiedBudget ? (
                          <p className="text-lg font-bold text-green-600 mt-2">
                            Budget: ${product.adminModifiedBudget}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 mt-2">Budget pending admin approval</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        product.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        product.status === 'demo_submitted' ? 'bg-yellow-100 text-yellow-800' :
                        product.status === 'demo_approved' ? 'bg-green-100 text-green-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {product.status === 'accepted' ? 'Accepted' : 
                         product.status === 'demo_submitted' ? 'Demo Submitted' :
                         product.status === 'demo_approved' ? 'Demo Approved' :
                         'Approved'}
                      </span>
                    </div>
                    {product.status === 'accepted' && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        {showDemoForm === product.id ? (
                          <div className="space-y-4">
                            {/* Upload Type Selection */}
                            <div className="flex gap-4 mb-4">
                              <button
                                onClick={() => setUploadType('url')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                  uploadType === 'url'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                📎 Link URL
                              </button>
                              <button
                                onClick={() => setUploadType('file')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                  uploadType === 'file'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                📄 Upload Document
                              </button>
                            </div>

                            {uploadType === 'url' ? (
                              <div>
                                <label className="block text-sm font-semibold text-gray-200 mb-2">
                                  Demo URL (Link to your work)
                                </label>
                                <input
                                  type="url"
                                  value={demoData.url}
                                  onChange={(e) => setDemoData({ ...demoData, url: e.target.value })}
                                  placeholder="https://example.com/demo or YouTube link, etc."
                                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-100 placeholder-gray-500 font-medium"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="block text-sm font-semibold text-gray-200 mb-2">
                                  Upload Document (PDF, DOC, DOCX, etc.)
                                </label>
                                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        if (file.size > 10 * 1024 * 1024) {
                                          addNotification('File size must be less than 10MB', 'error')
                                          return
                                        }
                                        setDemoData({ ...demoData, file })
                                      }
                                    }}
                                    className="hidden"
                                    id={`file-upload-${product.id}`}
                                  />
                                  <label
                                    htmlFor={`file-upload-${product.id}`}
                                    className="cursor-pointer flex flex-col items-center gap-2"
                                  >
                                    <div className="text-4xl">📁</div>
                                    <div className="text-gray-300">
                                      {demoData.file ? (
                                        <span className="text-green-400 font-semibold">{demoData.file.name}</span>
                                      ) : (
                                        <>
                                          <span className="text-blue-400 hover:text-blue-300">Click to upload</span>
                                          <span className="text-gray-500 block text-sm mt-1">or drag and drop</span>
                                          <span className="text-gray-500 text-xs block mt-1">PDF, DOC, DOCX, TXT, ZIP, RAR (Max 10MB)</span>
                                        </>
                                      )}
                                    </div>
                                  </label>
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="block text-sm font-semibold text-gray-200 mb-2">
                                Description (Optional)
                              </label>
                              <textarea
                                value={demoData.description}
                                onChange={(e) => setDemoData({ ...demoData, description: e.target.value })}
                                rows={3}
                                placeholder="Describe your demo..."
                                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-100 placeholder-gray-500 font-medium"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSubmitDemo(product.id)}
                                disabled={uploading}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
                              >
                                {uploading ? 'Uploading...' : 'Submit Demo'}
                              </button>
                              <button
                                onClick={() => {
                                  setShowDemoForm(null)
                                  setDemoData({ url: '', description: '', file: null })
                                  setUploadType('url')
                                }}
                                className="bg-gray-700 text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-600 font-semibold"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowDemoForm(product.id)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold shadow-lg transform hover:scale-105 transition-all"
                          >
                            📤 Upload Demo
                          </button>
                        )}
                      </div>
                    )}
                    {product.status === 'demo_submitted' && product.demoUrl && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-sm text-gray-300 mb-2">
                          <strong className="text-gray-100">Demo Submitted:</strong>{' '}
                          <a href={product.demoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
                            View Demo →
                          </a>
                        </p>
                        {product.demoDescription && (
                          <p className="text-sm text-gray-400">{product.demoDescription}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Waiting for approval...
                        </p>
                      </div>
                    )}
                    {product.status === 'demo_approved' && product.demoUrl && (
                      <div className="mt-4 pt-4 border-t border-gray-700 bg-green-900/20 p-3 rounded-lg">
                        <p className="text-sm text-green-400 font-semibold mb-2">
                          ✓ Demo Approved!
                        </p>
                        <a href={product.demoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline text-sm">
                          View Demo →
                        </a>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Posted: {new Date(product.createdAt).toLocaleString()}
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

