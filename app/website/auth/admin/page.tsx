'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Building,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Key
} from 'lucide-react'
import { createUserProfile } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminAuth() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    department: '',
    position: ''
  })

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Check user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role && ['admin', 'analyst', 'dmf_head'].includes(profile.role)) {
          router.push('/dashboard')
        } else {
          router.push('/citizen')
        }
      }
    }
    checkUser()
  }, [router])

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) throw error

      // Check user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, name, department')
        .eq('id', data.user.id)
        .single()

      let effectiveProfile = profile

      if (!effectiveProfile) {
        // Create profile if missing (first-time login)
        try {
          const created = await createUserProfile(
            data.user.id,
            data.user.email!,
            data.user.user_metadata?.name || ''
          )
          // Use the newly created profile immediately
          effectiveProfile = created
        } catch (e) {
          // Surface a clearer error but don't crash
          setError('Profile creation failed. Please contact admin.')
          await supabase.auth.signOut()
          return
        }
      }

      if (!effectiveProfile?.role || !['admin', 'analyst', 'dmf_head'].includes(effectiveProfile.role)) {
        setError('Access denied. This portal is for authorized personnel only.')
        await supabase.auth.signOut()
        return
      }

      // Redirect based on role
      if (effectiveProfile?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!formData.email) {
      setError('Please enter your email address first.')
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/admin/reset-password`
      })

      if (error) throw error
      setSuccess('Password reset email sent! Check your inbox.')
    } catch (error: any) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen gov-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center text-blue-300 hover:text-blue-200 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </button>
          
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-600 rounded-full">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-blue-200">
            Access the disaster management dashboard
          </p>
        </div>

        {/* Form */}
        <div className="gov-card p-8 text-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm text-green-800">{success}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-[#12283e] border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your admin email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 bg-[#12283e] border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium gov-btn gov-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center">
                  <Key className="h-4 w-4 mr-2" />
                  Access Dashboard
                </div>
              )}
            </button>

            {/* Password Reset */}
            <div className="text-center">
              <button
                type="button"
                onClick={handlePasswordReset}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </button>
            </div>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-300">New to SamudraSetu?</span>{' '}
            <button
              type="button"
              onClick={() => router.push('/website/auth/admin/signup')}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
              Request access (Sign up)
            </button>
          </div>

          {/* Access Levels */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-100 mb-3">Access Levels</h3>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span><strong>Admin:</strong> Full system access and user management</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span><strong>DMF Head:</strong> Disaster management oversight</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span><strong>Analyst:</strong> Report verification and monitoring</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center">
          <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-5 w-5 text-blue-300 mr-2" />
              <span className="text-sm font-medium text-blue-200">Secure Access</span>
            </div>
            <p className="text-xs text-blue-300">
              This portal is restricted to authorized disaster management personnel only. 
              All activities are logged and monitored for security purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
