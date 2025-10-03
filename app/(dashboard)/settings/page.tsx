'use client';

import { useEffect, useRef, useState } from 'react';
import { Settings, Save, Bell, Shield, Database, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false
    },
    system: {
      autoAssign: true,
      requireApproval: false,
      maxFileSize: '10MB'
    },
    security: {
      twoFactor: false,
      sessionTimeout: '30'
    }
  });
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('app_settings')
      if (raw) {
        const parsed = JSON.parse(raw)
        setSettings((prev: any) => ({ ...prev, ...parsed }))
      }
    } catch {}
  }, [])

  const handleSave = () => {
    // In a real app, you'd save to the backend
    console.log('Saving settings:', settings);
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings))
    } catch {}
    toast.success('Settings saved successfully!');
  };

  const handleExport = () => {
    try {
      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'settings.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      toast.error('Failed to export settings')
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImport = async (file?: File) => {
    try {
      if (!file) return
      const text = await file.text()
      const parsed = JSON.parse(text)
      setSettings((prev: any) => ({ ...prev, ...parsed }))
      localStorage.setItem('app_settings', JSON.stringify({ ...settings, ...parsed }))
      toast.success('Settings imported')
    } catch (e) {
      toast.error('Invalid settings file')
    }
  }

  const requestPushPermission = async () => {
    try {
      if (!('Notification' in window)) {
        toast.error('Notifications not supported')
        return
      }
      const perm = await Notification.requestPermission()
      if (perm === 'granted') {
        new Notification('Notifications enabled', { body: 'You will receive updates.' })
        setSettings((prev: any) => ({ ...prev, notifications: { ...prev.notifications, push: true } }))
        toast.success('Push notifications enabled')
      } else if (perm === 'denied') {
        setSettings((prev: any) => ({ ...prev, notifications: { ...prev.notifications, push: false } }))
        toast('Permission denied')
      }
    } catch (e) {
      toast.error('Failed to request permission')
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
              <p className="text-gray-600">Manage your application preferences and system configuration</p>
            </div>

            <div className="space-y-8">
              {/* Notifications */}
              <div className="card">
                <div className="flex items-center mb-6">
                  <Bell className="h-6 w-6 text-primary-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={(e: any) => setSettings((prev: any) => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: e.target.checked }
                        }))}
                        className="sr-only peer"
                        aria-label="Enable email notifications"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                      <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.push}
                        onChange={(e: any) => {
                          const checked = e.target.checked
                          setSettings((prev: any) => ({ ...prev, notifications: { ...prev.notifications, push: checked } }))
                          if (checked) requestPushPermission()
                        }}
                        className="sr-only peer"
                        aria-label="Enable push notifications"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div>
                    <button className="btn btn-ghost" onClick={requestPushPermission} aria-label="Test notification">
                      Send test notification
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
                      <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.sms}
                        onChange={(e: any) => setSettings((prev: any) => ({
                          ...prev,
                          notifications: { ...prev.notifications, sms: e.target.checked }
                        }))}
                        className="sr-only peer"
                        aria-label="Enable SMS notifications"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* System Settings */}
              <div className="card">
                <div className="flex items-center mb-6">
                  <Database className="h-6 w-6 text-primary-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Auto-assign Issues</h3>
                      <p className="text-sm text-gray-500">Automatically assign issues to departments</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.system.autoAssign}
                        onChange={(e: any) => setSettings((prev: any) => ({
                          ...prev,
                          system: { ...prev.system, autoAssign: e.target.checked }
                        }))}
                        className="sr-only peer"
                        aria-label="Enable auto-assign issues"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Require Approval</h3>
                      <p className="text-sm text-gray-500">Require admin approval for status changes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.system.requireApproval}
                        onChange={(e: any) => setSettings((prev: any) => ({
                          ...prev,
                          system: { ...prev.system, requireApproval: e.target.checked }
                        }))}
                        className="sr-only peer"
                        aria-label="Enable require approval"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum File Size
                    </label>
                    <select
                      value={settings.system.maxFileSize}
                      onChange={(e: any) => setSettings((prev: any) => ({
                        ...prev,
                        system: { ...prev.system, maxFileSize: e.target.value }
                      }))}
                      className="select w-32"
                      aria-label="Select maximum file size"
                    >
                      <option value="5MB">5MB</option>
                      <option value="10MB">10MB</option>
                      <option value="25MB">25MB</option>
                      <option value="50MB">50MB</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="card">
                <div className="flex items-center mb-6">
                  <Shield className="h-6 w-6 text-primary-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactor}
                        onChange={(e: any) => setSettings((prev: any) => ({
                          ...prev,
                          security: { ...prev.security, twoFactor: e.target.checked }
                        }))}
                        className="sr-only peer"
                        aria-label="Enable two-factor authentication"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <select
                      value={settings.security.sessionTimeout}
                      onChange={(e: any) => setSettings((prev: any) => ({
                        ...prev,
                        security: { ...prev.security, sessionTimeout: e.target.value }
                      }))}
                      className="select w-32"
                      aria-label="Select session timeout"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                  <div className="mt-2">
                    <button className="btn btn-ghost" onClick={() => { localStorage.setItem('app_settings', JSON.stringify(settings)); toast.success('Session timeout applied'); }}>
                      Apply session timeout
                    </button>
                  </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
              <div className="flex items-center gap-3">
                <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(e) => handleImport(e.target.files?.[0] || undefined)} aria-label="Import settings file" title="Import settings file" />
                <button className="btn" onClick={handleExport} aria-label="Export settings as JSON">Export</button>
                <button className="btn" onClick={handleImportClick} aria-label="Import settings from JSON">Import</button>
                <button
                  onClick={handleSave}
                  className="btn btn-primary flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </button>
              </div>
              </div>
          </div>
        </div>
        </div>
  );
}
