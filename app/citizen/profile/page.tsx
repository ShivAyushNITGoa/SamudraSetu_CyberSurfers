'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { getUserReports, CitizenReport } from '@/lib/citizen-queries'
import { User, Mail, Phone, MapPin, Calendar, LogOut, Settings, Edit3, Camera, Award, TrendingUp, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/LoadingSpinner'
import DatabaseStatus from '@/components/DatabaseStatus'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [userReports, setUserReports] = useState<CitizenReport[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'reports'>('profile')
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user) {
      // Test database connection first
      testDatabaseConnection()
      loadUserReports()
      loadUserProfile()
    }
  }, [user])

  const testDatabaseConnection = async () => {
    try {
      console.log('🔍 Testing database connection...')
      const { data, error } = await supabase
        .from('ocean_hazard_reports')
        .select('count')
        .limit(1)
      
      if (error) {
        console.error('❌ Database connection test failed:', error)
      } else {
        console.log('✅ Database connection test successful')
      }
    } catch (error) {
      console.error('❌ Database connection test error:', error)
    }
  }

  const loadUserProfile = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error)
      } else if (data) {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const loadUserReports = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      console.log('🔄 Loading user reports for user:', user.id)
      const reports = await getUserReports(user.id)
      console.log('✅ Successfully loaded reports:', reports.length)
      setUserReports(reports)
    } catch (error) {
      console.error('❌ Error loading user reports:', error)
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      toast.error(`Failed to load your reports: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'in_progress': return 'In Progress'
      case 'resolved': return 'Resolved'
      default: return status
    }
  }

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      infrastructure: 'Infrastructure',
      environment: 'Environment',
      safety: 'Public Safety',
      transport: 'Transport',
      utilities: 'Utilities',
      other: 'Other'
    }
    return categoryMap[category] || category
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Not signed in</h2>
          <p className="text-gray-600">Please sign in to view your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Profile
            </h1>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Debug Database Status */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <DatabaseStatus />
      </div>

      {/* Profile Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg">
                {userProfile?.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <User className="h-12 w-12 text-blue-600" />
                )}
              </div>
              <button
                onClick={() => {/* TODO: Add avatar upload */}}
                className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                aria-label="Upload avatar"
                title="Upload avatar"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {userProfile?.name || user.user_metadata?.full_name || 'User'}
              </h2>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <div className="flex items-center justify-center sm:justify-start space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                {userProfile?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>{userProfile.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{userReports.length}</p>
                <p className="text-xs text-gray-600">Total Reports</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {userReports.filter(r => r.status === 'resolved').length}
                </p>
                <p className="text-xs text-gray-600">Resolved</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {userReports.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Settings className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">
                  {userReports.filter(r => r.status === 'in_progress').length}
                </p>
                <p className="text-xs text-gray-600">In Progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 bg-gray-100/80 backdrop-blur-sm p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <User className="h-4 w-4 mr-2" />
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'reports'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              My Reports ({userReports.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-20">
        {activeTab === 'profile' ? (
          <div className="space-y-6">
            {/* Profile Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h3>
              <div className="space-y-6">
                <div className="flex items-center p-4 bg-gray-50/50 rounded-xl">
                  <div className="p-2 bg-blue-100 rounded-lg mr-4">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Full Name</p>
                    <p className="text-gray-600">
                      {userProfile?.name || user.user_metadata?.full_name || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50/50 rounded-xl">
                  <div className="p-2 bg-green-100 rounded-lg mr-4">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Email</p>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50/50 rounded-xl">
                  <div className="p-2 bg-purple-100 rounded-lg mr-4">
                    <Phone className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Phone</p>
                    <p className="text-gray-600">
                      {userProfile?.phone || user.user_metadata?.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50/50 rounded-xl">
                  <div className="p-2 bg-orange-100 rounded-lg mr-4">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Member Since</p>
                    <p className="text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Edit3 className="h-5 w-5 mr-3" />
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
              <button className="w-full flex items-center justify-center px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200">
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {userReports.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No reports yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't submitted any reports yet. Start by reporting an issue in your area.
                  </p>
                  <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                    <Edit3 className="h-5 w-5 mr-2" />
                    Report an Issue
                  </button>
                </div>
              </div>
            ) : (
              userReports.map((report) => (
                <div key={report.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {report.description}
                      </p>
                    </div>
                    {report.media_urls && report.media_urls.length > 0 && (
                      <div className="ml-3 flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-sm">
                          <img
                            src={report.media_urls[0]}
                            alt="Report"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200">
                      {getCategoryLabel(report.hazard_type)}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(report.status)}`}>
                      {getStatusLabel(report.status)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="p-1.5 bg-gray-100 rounded-lg mr-2">
                        <MapPin className="h-3.5 w-3.5 text-gray-600" />
                      </div>
                      <span className="truncate">
                        {report.address || 'Location not specified'}
                      </span>
                    </div>
                    <div className="flex items-center ml-2">
                      <div className="p-1.5 bg-gray-100 rounded-lg mr-2">
                        <Calendar className="h-3.5 w-3.5 text-gray-600" />
                      </div>
                      <span className="whitespace-nowrap">
                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
