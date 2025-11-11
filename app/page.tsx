import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      backgroundImage: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%), url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              U
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">User-Seller Platform</h1>
              <p className="text-sm text-white/80">Connecting talent with opportunity</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a href="#features" className="text-white/90 hover:text-white font-medium transition-colors">Features</a>
            <a href="#how-it-works" className="text-white/90 hover:text-white font-medium transition-colors">How It Works</a>
            <a href="#stats" className="text-white/90 hover:text-white font-medium transition-colors">Stats</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fadeIn">
          <div className="inline-block mb-6">
            <span className="text-6xl animate-bounce">🚀</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
            Welcome to the Future of
            <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Project Collaboration
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-medium drop-shadow-lg">
            Connect users, sellers, and admins in one seamless platform. 
            Submit projects, find talent, and bring ideas to life.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
            <div className="glass p-4 rounded-2xl border-2 border-white/30">
              <div className="text-3xl font-bold text-white mb-1">1000+</div>
              <div className="text-sm text-white/80">Active Users</div>
            </div>
            <div className="glass p-4 rounded-2xl border-2 border-white/30">
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-sm text-white/80">Projects Completed</div>
            </div>
            <div className="glass p-4 rounded-2xl border-2 border-white/30">
              <div className="text-3xl font-bold text-white mb-1">200+</div>
              <div className="text-sm text-white/80">Expert Sellers</div>
            </div>
          </div>
        </div>

        {/* Login Cards */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mb-16">
          <Link
            href="/login/user"
            className="glass p-8 rounded-3xl shadow-2xl border-2 border-white/30 hover-lift animate-fadeIn group relative overflow-hidden"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">👤</div>
              <h3 className="text-2xl font-bold text-white mb-2">User Portal</h3>
              <p className="text-white/80 mb-6">Submit your projects and track their progress from start to finish</p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <span className="text-green-400">✓</span>
                  <span>Submit Projects</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <span className="text-green-400">✓</span>
                  <span>Track Status</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <span className="text-green-400">✓</span>
                  <span>Review Demos</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-center group-hover:from-blue-700 group-hover:to-indigo-700 transition-all transform group-hover:scale-105">
                Login as User →
              </div>
            </div>
          </Link>

          <Link
            href="/login/seller"
            className="glass p-8 rounded-3xl shadow-2xl border-2 border-white/30 hover-lift animate-fadeIn group relative overflow-hidden"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🛒</div>
              <h3 className="text-2xl font-bold text-white mb-2">Seller Portal</h3>
              <p className="text-white/80 mb-6">Find exciting projects and showcase your skills to earn money</p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <span className="text-green-400">✓</span>
                  <span>Browse Projects</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <span className="text-green-400">✓</span>
                  <span>Submit Demos</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <span className="text-green-400">✓</span>
                  <span>Build Portfolio</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold text-center group-hover:from-green-700 group-hover:to-emerald-700 transition-all transform group-hover:scale-105">
                Login as Seller →
              </div>
            </div>
          </Link>

          <Link
            href="/login/admin"
            className="glass p-8 rounded-3xl shadow-2xl border-2 border-white/30 hover-lift animate-fadeIn group relative overflow-hidden"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">👨‍💼</div>
              <h3 className="text-2xl font-bold text-white mb-2">Admin Portal</h3>
              <p className="text-white/80 mb-6">Manage the platform and oversee all operations</p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <span className="text-green-400">✓</span>
                  <span>Review Projects</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <span className="text-green-400">✓</span>
                  <span>Manage Budgets</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <span className="text-green-400">✓</span>
                  <span>Analytics Dashboard</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold text-center group-hover:from-purple-700 group-hover:to-pink-700 transition-all transform group-hover:scale-105">
                Login as Admin →
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div id="features" className="max-w-6xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12 drop-shadow-lg">Why Choose Our Platform?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-2xl border-2 border-white/30 hover-lift animate-fadeIn">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-white/80">Get your projects reviewed and approved in record time</p>
            </div>
            <div className="glass p-6 rounded-2xl border-2 border-white/30 hover-lift animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-white mb-2">Secure & Safe</h3>
              <p className="text-white/80">Your data and projects are protected with enterprise-grade security</p>
            </div>
            <div className="glass p-6 rounded-2xl border-2 border-white/30 hover-lift animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-bold text-white mb-2">Premium Quality</h3>
              <p className="text-white/80">Work with verified sellers and get top-notch results</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="max-w-5xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12 drop-shadow-lg">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Submit', desc: 'User submits project details', icon: '📝' },
              { step: '2', title: 'Review', desc: 'Admin reviews and approves', icon: '👀' },
              { step: '3', title: 'Match', desc: 'Sellers accept and work', icon: '🤝' },
              { step: '4', title: 'Deliver', desc: 'Demo submitted and approved', icon: '✅' }
            ].map((item, index) => (
              <div key={index} className="glass p-6 rounded-2xl border-2 border-white/30 text-center hover-lift animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/80 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto text-center glass p-12 rounded-3xl border-2 border-white/30 animate-fadeIn">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8">Join thousands of users and sellers already on the platform</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register/user"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Sign Up as User
            </Link>
            <Link
              href="/register/seller"
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Sign Up as Seller
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 mt-20 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-white/80">© 2024 User-Seller Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
