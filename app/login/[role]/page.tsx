'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const params = useParams()
  const router = useRouter()
  const role = params.role as string
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const roleConfig: Record<string, any> = {
    user: {
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
      bgImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80',
      icon: '👤',
      title: 'User Portal',
      subtitle: 'Submit your projects and track progress',
      accent: 'blue',
      features: ['Submit Projects', 'Track Status', 'Review Demos', 'Manage Budget']
    },
    seller: {
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      bgImage: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1920&q=80',
      icon: '🛒',
      title: 'Seller Portal',
      subtitle: 'Find projects and showcase your work',
      accent: 'green',
      features: ['Browse Projects', 'Submit Demos', 'Track Earnings', 'Build Portfolio']
    },
    admin: {
      gradient: 'from-purple-600 via-pink-600 to-red-500',
      bgImage: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
      icon: '👨‍💼',
      title: 'Admin Portal',
      subtitle: 'Manage platform and oversee operations',
      accent: 'purple',
      features: ['Review Projects', 'Manage Budgets', 'Monitor Activity', 'Analytics Dashboard']
    }
  }

  const config = roleConfig[role] || roleConfig.user

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      // Redirect based on role
      if (data.user.role === 'user') {
        router.push('/dashboard/user')
      } else if (data.user.role === 'seller') {
        router.push('/dashboard/seller')
      } else if (data.user.role === 'admin') {
        router.push('/dashboard/admin')
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%), url(${config.bgImage})`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br opacity-60" style={{
          background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
          '--tw-gradient-from': role === 'user' ? 'rgb(37 99 235)' : role === 'seller' ? 'rgb(34 197 94)' : 'rgb(147 51 234)',
          '--tw-gradient-to': role === 'user' ? 'rgb(99 102 241)' : role === 'seller' ? 'rgb(16 185 129)' : 'rgb(236 72 153)',
          '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to)'
        } as any}></div>
      </div>

      {/* Floating Shapes Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden md:block text-white space-y-6 animate-fadeIn">
            <div className="space-y-4">
              <div className="text-7xl mb-4 animate-bounce">{config.icon}</div>
              <h1 className="text-5xl font-bold mb-2">{config.title}</h1>
              <p className="text-xl text-white/90 mb-8">{config.subtitle}</p>
              
              <div className="space-y-3 mt-8">
                {config.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 animate-slideIn" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 p-6 glass-dark rounded-2xl border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" 
                  alt="User" 
                  className="w-16 h-16 rounded-full border-2 border-white/30"
                />
                <div>
                  <p className="font-semibold">Join thousands of users</p>
                  <p className="text-sm text-white/70">Trusted by professionals worldwide</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full">
            <div className="glass p-8 md:p-10 rounded-3xl shadow-2xl border-2 border-white/30 backdrop-blur-xl animate-fadeIn">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4 animate-bounce">{config.icon}</div>
                <h2 className="text-3xl font-bold text-white mb-2">{config.title}</h2>
                <p className="text-white/80">Welcome back! Please login to continue</p>
              </div>

              {error && (
                <div className="mb-6 bg-red-500/20 border-2 border-red-500 text-red-100 px-4 py-3 rounded-xl animate-slideIn">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-white/90">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-white/60 text-xl">📧</span>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-3 bg-gray-800/90 border-2 border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-white/50 focus:bg-gray-800 transition-all backdrop-blur-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-white/90">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-white/60 text-xl">🔒</span>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-12 py-3 bg-gray-800/90 border-2 border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-white/50 focus:bg-gray-800 transition-all backdrop-blur-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      <span className="text-xl">{showPassword ? '👁️' : '👁️‍🗨️'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-white/80 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="text-white/80 hover:text-white text-sm transition-colors">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r ${config.gradient} text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span>Login</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>

              {role !== 'admin' && (
                <div className="mt-6 text-center">
                  <p className="text-white/80 mb-2">
                    Don't have an account?{' '}
                    <Link href={`/register/${role}`} className="text-white font-semibold hover:underline">
                      Register here
                    </Link>
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-white/20 text-center">
                <Link href="/" className="text-white/70 hover:text-white text-sm transition-colors flex items-center justify-center gap-2">
                  <span>←</span>
                  <span>Back to home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
