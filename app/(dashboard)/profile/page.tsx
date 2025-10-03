'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Camera, 
  Save, 
  Eye, 
  EyeOff, 
  Shield, 
  Download, 
  LogOut, 
  Settings, 
  Bell, 
  Moon, 
  Sun,
  Calendar,
  CheckCircle,
  AlertCircle,
  Edit3,
  Trash2,
  Upload,
  X
} from 'lucide-react'

interface FormState {
  name: string
  phone?: string
  department?: string
  avatar_url?: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '' } as FormState)
  const [initialForm, setInitialForm] = useState({ name: '' } as FormState)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null as string | null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null as string | null)
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdMessage, setPwdMessage] = useState(null as string | null)
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [role, setRole] = useState(null as string | null)
  const [createdAt, setCreatedAt] = useState(null as string | null)
  const [emailEdit, setEmailEdit] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState(() => {
    if (typeof window === 'undefined') return true
    const raw = localStorage.getItem('pref_notify_email')
    return raw ? raw === '1' : true
  })
  const [notifySms, setNotifySms] = useState(() => {
    if (typeof window === 'undefined') return false
    const raw = localStorage.getItem('pref_notify_sms')
    return raw ? raw === '1' : false
  })
  const [themeDark, setThemeDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const raw = localStorage.getItem('pref_theme_dark')
    return raw ? raw === '1' : false
  })

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialForm), [form, initialForm])

  const initials = useMemo(() => {
    const name = (form.name || (user?.email || 'User')).trim()
    const parts = name.split(/\s+/)
    const letters = (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
    return letters.toUpperCase() || 'U'
  }, [form.name, user?.email])

  const placeholderAvatar = useMemo(() => {
    const bg = '#3b82f6'
    const fg = '#ffffff'
    const svg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>
        <rect width='100%' height='100%' rx='64' ry='64' fill='${bg}'/>
        <text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='Inter,system-ui,sans-serif' font-size='56' font-weight='700' fill='${fg}'>${initials}</text>
      </svg>`
    )
    return `data:image/svg+xml;charset=UTF-8,${svg}`
  }, [initials])

  const avatarSrc = previewUrl || form.avatar_url || placeholderAvatar

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, phone, department, avatar_url, role, created_at')
          .eq('id', user.id)
          .single()
        if (error) throw error
        setForm((prev: FormState) => {
          const next = { name: data?.name || '', phone: data?.phone || '', department: data?.department || '', avatar_url: data?.avatar_url || '' }
          // avoid extra re-render if unchanged
          return JSON.stringify(prev) === JSON.stringify(next) ? prev : next
        })
        setInitialForm({
          name: data?.name || '',
          phone: data?.phone || '',
          department: data?.department || '',
          avatar_url: data?.avatar_url || ''
        })
        setRole(data?.role || null)
        setCreatedAt(data?.created_at || null)
        setEmailEdit(user?.email || '')
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  useEffect(() => {
    // Apply theme preference
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', themeDark)
    }
  }, [themeDark])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const onSave = async () => {
    if (!user?.id) return
    setSaving(true)
    setMessage(null)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: form.name, phone: form.phone, department: form.department, avatar_url: form.avatar_url })
        .eq('id', user.id)
      if (error) throw error
      // Also update auth metadata name for display
      await supabase.auth.updateUser({ data: { name: form.name, avatar_url: form.avatar_url } })
      const { data: refreshed, error: refErr } = await supabase
        .from('profiles')
        .select('name, phone, department, avatar_url')
        .eq('id', user.id)
        .single()
      if (refErr) throw refErr
      setForm({
        name: refreshed?.name || '',
        phone: refreshed?.phone || '',
        department: refreshed?.department || '',
        avatar_url: refreshed?.avatar_url || ''
      })
      setInitialForm({
        name: refreshed?.name || '',
        phone: refreshed?.phone || '',
        department: refreshed?.department || '',
        avatar_url: refreshed?.avatar_url || ''
      })
      setMessage('Profile updated successfully')
    } catch (e) {
      const msg = (e as any)?.message || 'Unknown error'
      setMessage(`Failed to update profile: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  const onChangeEmail = async () => {
    if (!emailEdit || emailEdit === user?.email) return
    setEmailSaving(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.updateUser({ email: emailEdit })
      if (error) throw error
      setMessage('Check your inbox to confirm email change')
    } catch (e) {
      const msg = (e as any)?.message || 'Unknown error'
      setMessage(`Failed to update email: ${msg}`)
    } finally {
      setEmailSaving(false)
    }
  }

  const onSavePreferences = () => {
    try {
      localStorage.setItem('pref_notify_email', notifyEmail ? '1' : '0')
      localStorage.setItem('pref_notify_sms', notifySms ? '1' : '0')
      setMessage('Preferences saved')
    } catch {
      setMessage('Failed to save preferences')
    }
  }

  const onChangePassword = async () => {
    setPwdMessage(null)
    if (!passwords.next || passwords.next.length < 8) {
      setPwdMessage('New password must be at least 8 characters')
      return
    }
    if (passwords.next !== passwords.confirm) {
      setPwdMessage('Passwords do not match')
      return
    }
    setPwdSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.next })
      if (error) throw error
      setPwdMessage('Password updated successfully')
      setPasswords({ current: '', next: '', confirm: '' })
    } catch (e) {
      const msg = (e as any)?.message || 'Unknown error'
      setPwdMessage(`Failed to update password: ${msg}`)
    } finally {
      setPwdSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-6">
                {/* Avatar Section */}
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto">
                      <img 
                        src={avatarSrc} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                      {uploading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        onChange={async (e: any) => {
                          const file = e.target.files?.[0]
                          if (!file || !user?.id) return
                          if (!/^image\//.test(file.type)) {
                            setMessage('Please select a valid image file')
                            return
                          }
                          if (file.size > 2 * 1024 * 1024) {
                            setMessage('Image is too large (max 2MB)')
                            return
                          }
                          const objectUrl = URL.createObjectURL(file)
                          setPreviewUrl(objectUrl)
                          setUploading(true)
                          setMessage(null)
                          try {
                            const fileExt = file.name.split('.').pop()
                            const path = `${user.id}/${Date.now()}.${fileExt}`
                            const bucketName = 'avatars'
                            const { data: up, error: upErr } = await supabase.storage.from(bucketName).upload(path, file, { upsert: false })
                              if (upErr) throw upErr
                            const uploadResult = { data: up, bucket: bucketName }
                            
                            if (!uploadResult) throw new Error('Upload failed')
                            
                            const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(uploadResult.data.path)
                            let finalUrl = urlData?.publicUrl || ''
                            
                            if (!finalUrl) {
                              try {
                                const { data: signed } = await supabase.storage.from(bucketName).createSignedUrl(uploadResult.data.path, 60 * 60 * 24 * 365)
                                if (signed?.signedUrl) finalUrl = signed.signedUrl
                              } catch {}
                            }
                            
                            if (!finalUrl) {
                              const reader = new FileReader()
                              reader.onload = (e) => {
                                const dataUrl = e.target?.result as string
                                setForm((prev: FormState) => ({ ...prev, avatar_url: dataUrl }))
                                supabase.from('profiles').update({ avatar_url: dataUrl }).eq('id', user.id)
                                supabase.auth.updateUser({ data: { avatar_url: dataUrl } })
                              }
                              reader.readAsDataURL(file)
                              setMessage('Avatar saved locally')
                              return
                            }
                            
                            setForm((prev: FormState) => ({ ...prev, avatar_url: finalUrl }))
                            const { error: updErr } = await supabase.from('profiles').update({ avatar_url: finalUrl }).eq('id', user.id)
                            if (updErr) throw updErr
                            await supabase.auth.updateUser({ data: { avatar_url: finalUrl } })
                            setMessage('Avatar updated successfully')
                          } catch (err) {
                            const msg = (err as any)?.message || ''
                            setMessage(`Failed to upload avatar: ${msg}`)
                            setPreviewUrl(null)
                          } finally {
                            setUploading(false)
                            setTimeout(() => { if (objectUrl) URL.revokeObjectURL(objectUrl) }, 2000)
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mt-4">{form.name || 'User'}</h2>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {role && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        role === 'admin' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {role}
                      </span>
                    )}
                  </div>
                  {createdAt && (
                    <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">User ID</span>
                    <span className="text-xs font-mono text-gray-500">{user?.id?.slice(0, 8)}...</span>
                  </div>
                  {isDirty && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm text-amber-700">Unsaved changes</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  <button
                    onClick={onSave}
                    disabled={saving || !isDirty}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  
                  <button
                    onClick={() => {
                      const data = { id: user?.id, email: user?.email, role, createdAt, profile: form }
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'profile-export.json'
                      document.body.appendChild(a)
                      a.click()
                      a.remove()
                      URL.revokeObjectURL(url)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Export Data
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        value={form.name}
                        onChange={(e: any) => setForm({ ...form, name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        value={form.phone || ''}
                        onChange={(e: any) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        value={form.department || ''}
                        onChange={(e: any) => setForm({ ...form, department: e.target.value })}
                        placeholder="e.g., Public Works"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        value={emailEdit}
                        onChange={(e: any) => setEmailEdit(e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                    <button
                      onClick={onChangeEmail}
                      disabled={emailSaving || !emailEdit || emailEdit === user?.email}
                      className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {emailSaving ? 'Sending confirmation...' : 'Update email'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Security</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Change Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter current password"
                          value={passwords.current}
                          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter new password"
                          value={passwords.next}
                          onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirm new password"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-gray-500">Use at least 8 characters</p>
                      <button
                        onClick={onChangePassword}
                        disabled={pwdSaving}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {pwdSaving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                    {pwdMessage && (
                      <div className={`mt-3 p-3 rounded-lg ${
                        pwdMessage.includes('successfully') 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {pwdMessage}
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Sessions</h4>
                    <button
                      onClick={async () => {
                        try {
                          await supabase.auth.signOut({ scope: 'global' })
                          setMessage('Signed out all sessions')
                        } catch {
                          try {
                            await supabase.auth.signOut()
                            setMessage('Signed out of this session')
                          } catch (e) {
                            setMessage('Failed to sign out')
                          }
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out all sessions
                    </button>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Preferences</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">Notifications</h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notifyEmail} 
                          onChange={(e) => setNotifyEmail(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Bell className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">Email notifications for status updates</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notifySms} 
                          onChange={(e) => setNotifySms(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">SMS notifications for urgent issues</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Appearance</h4>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={themeDark} 
                        onChange={(e) => {
                          setThemeDark(e.target.checked)
                          try { localStorage.setItem('pref_theme_dark', e.target.checked ? '1' : '0') } catch {}
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      {themeDark ? <Moon className="h-4 w-4 text-gray-400" /> : <Sun className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm text-gray-700">Use dark theme</span>
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={onSavePreferences} 
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {message && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
            message.includes('successfully') || message.includes('saved') || message.includes('updated')
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.includes('successfully') || message.includes('saved') || message.includes('updated') ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="text-sm font-medium">{message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


