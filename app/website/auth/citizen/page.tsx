'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { signIn, signUp, createUserProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function CitizenAuthPage() {
  const [mounted, setMounted] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  })
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        // Show immediate feedback
        toast.loading('Signing in...', { id: 'signin' })
        
        // Handle login
        console.log('Attempting to sign in with:', formData.email)
        const { user, error } = await signIn(formData.email.trim(), formData.password)
        
        if (error) {
          console.error('Sign in error:', error)
          throw error
        }
        
        if (user) {
          console.log('Sign in successful, user:', user)
          toast.success('Login successful!', { id: 'signin' })
          // Wait until session is available to avoid guard loop
          const start = Date.now()
          let hasSession = false
          for (let i = 0; i < 10; i++) {
            const { data } = await supabase.auth.getSession()
            if (data?.session?.user) { hasSession = true; break }
            await new Promise(r => setTimeout(r, 150))
          }
          console.log('Session ready after ms:', Date.now() - start, 'hasSession:', hasSession)
          // Ensure profile exists (first login path)
          try {
            await createUserProfile(user.id, formData.email.trim(), formData.name || '')
          } catch (e) {
            console.warn('Profile create on login (citizen) optional:', e)
          }
          window.location.href = '/citizen'
        }
      } else {
        // Handle signup - allow any email for citizens
        toast.loading('Creating account...', { id: 'signup' })
        
        console.log('Attempting to sign up with:', formData.email)
        const { user, error } = await signUp(formData.email.trim(), formData.password, formData.name.trim(), { phone: formData.phone.trim() })
        
        if (error) {
          console.error('Sign up error:', error)
          throw error
        }
        
        if (user) {
          console.log('Sign up successful, user:', user)
          toast.success('Account created successfully! Please check your email to confirm your account.', { id: 'signup' })
          setIsLogin(true) // Switch to login mode
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error)
      const message = error?.message || 'Authentication failed. Please try again.'
      toast.error(message, { id: isLogin ? 'signin' : 'signup' })
      // Keep form values; no state reset here
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gov-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link
            href="/website"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Website
          </Link>
          
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Citizen {isLogin ? 'Login' : 'Sign Up'}
          </h2>
          <p className="text-gray-600">
            {isLogin 
              ? 'Access your citizen portal to report and track issues' 
              : 'Join the community and start making a difference'
            }
          </p>
        </div>

        {/* Form */}
        <div className="gov-card p-8 text-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full gov-input"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full gov-input pl-12"
                  placeholder="citizen@example.com"
                  required
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full gov-input"
                  placeholder="+91 98765 43210"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full gov-input pl-12 pr-12"
                  placeholder="Enter your password"
                  required
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link
                  href="#"
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-medium gov-btn gov-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Join Community'
              )}
            </button>
          </form>

          {/* Toggle between login and signup */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-green-600 hover:text-green-700 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex">
            <Globe className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Join the Community</p>
              <p>
                As a citizen, you can report issues, track progress, and engage with your community 
                to make your neighborhood a better place.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">Looking for something else?</p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/website/auth/admin"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Admin Login
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              href="/website"
              className="text-sm text-gray-600 hover:text-gray-700 font-medium"
            >
              Main Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
