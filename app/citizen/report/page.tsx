'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { 
  MapPin, 
  Camera, 
  Upload, 
  AlertTriangle,
  Waves,
  CloudRain,
  Droplets,
  Wind,
  Sun,
  Cloud,
  Navigation,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Save,
  Send
} from 'lucide-react'
import { offlineManager } from '@/lib/offline-manager'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const hazardTypes = [
  { value: 'tsunami', label: 'Tsunami', icon: Waves, color: 'text-red-600' },
  { value: 'storm_surge', label: 'Storm Surge', icon: CloudRain, color: 'text-orange-600' },
  { value: 'flooding', label: 'Flooding', icon: Droplets, color: 'text-blue-600' },
  { value: 'erosion', label: 'Coastal Erosion', icon: Wind, color: 'text-yellow-600' },
  { value: 'unusual_tides', label: 'Unusual Tides', icon: Sun, color: 'text-cyan-600' },
  { value: 'coastal_damage', label: 'Coastal Damage', icon: AlertTriangle, color: 'text-purple-600' },
  { value: 'marine_pollution', label: 'Marine Pollution', icon: Cloud, color: 'text-green-600' },
  { value: 'weather_anomaly', label: 'Weather Anomaly', icon: Navigation, color: 'text-indigo-600' },
  { value: 'other', label: 'Other', icon: AlertTriangle, color: 'text-gray-600' }
]

const severityLevels = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' }
]

export default function ReportHazard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hazard_type: '',
    severity: 'medium',
    location: {
      latitude: 0,
      longitude: 0,
      address: ''
    },
    media_files: [] as File[]
  })

  // Location state
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [locationLoading, setLocationLoading] = useState(false)

  // Check authentication
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/citizen/auth')
        return
      }
      setUser(user)
    }
    checkUser()
  }, [router])

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
          latitude,
          longitude
          }
        }))

        // Get address from coordinates
        try {
          // Use free Nominatim geocoding service (OpenStreetMap)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          )
          const data = await response.json()
          if (data.display_name) {
            setFormData(prev => ({
              ...prev,
              location: {
                ...prev.location,
                address: data.display_name
              }
            }))
          }
        } catch (error) {
          console.error('Error getting address:', error)
        }

        setLocationPermission('granted')
        setLocationLoading(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        setLocationPermission('denied')
        setLocationLoading(false)
      }
    )
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setFormData(prev => ({
      ...prev,
      media_files: [...prev.media_files, ...files]
    }))
  }

  // Remove file
  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media_files: prev.media_files.filter((_, i) => i !== index)
    }))
  }

  // Submit report
  const submitReport = async () => {
    if (!formData.title || !formData.description || !formData.hazard_type) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Submit report to database (GeoJSON for geography)
      const { data: inserted, error } = await supabase
        .from('ocean_hazard_reports')
        .insert([{
          title: formData.title,
          description: formData.description,
          hazard_type: formData.hazard_type,
          severity: formData.severity,
          location: formData.location ? { type: 'Point', coordinates: [formData.location.longitude, formData.location.latitude] } : null,
          address: formData.location?.address || '',
          user_id: user.id,
          status: 'unverified',
          confidence_score: 0.5,
          is_public: true,
          social_media_indicators: {}
        }])
        .select('id')
        .single()

      if (error) throw error

      const reportId = inserted?.id
      // Upload media files to Storage and record in report_media
      for (const file of formData.media_files) {
        const fileExt = file.name.split('.').pop()
        const storagePath = `${user.id}/${reportId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('hazard-reports')
          .upload(storagePath, file)
        if (uploadError) throw uploadError
        await supabase.from('report_media').insert({
          report_id: reportId,
          storage_path: storagePath,
          media_type: file.type.startsWith('video') ? 'video' : 'image'
        })
      }

      alert('Report submitted successfully!')
      router.push('/citizen')
    } catch (error) {
      console.error('Error submitting report:', error)
      try {
        // If offline or upload failed, queue the report locally
        const reportToQueue = {
          id: `offline-${Date.now()}`,
          title: formData.title,
          description: formData.description,
          hazard_type: formData.hazard_type,
          severity: formData.severity,
          location: { latitude: formData.location.latitude, longitude: formData.location.longitude, address: formData.location.address },
          media_files: formData.media_files.map(f => ({ name: f.name, size: f.size, type: f.type })),
          user_id: user.id,
          created_at: new Date().toISOString(),
          offline: true,
        }
        await offlineManager.storeReportOffline(reportToQueue)
        await offlineManager.storeOfflineData('last_offline_report', reportToQueue)
        alert('You appear to be offline. Your report was saved and will sync when online.')
        router.push('/citizen')
      } catch (e) {
        alert('Error submitting report. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
            <button
              onClick={() => router.back()}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                aria-label="Go back"
                title="Go back"
            >
                <ArrowLeft className="h-5 w-5" />
            </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Report Ocean Hazard</h1>
                <p className="text-gray-600">Help protect coastal communities by reporting hazards</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Step {currentStep} of 4</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
                </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Title *
          </label>
          <input
            type="text"
            value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the hazard"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
        </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of what you observed"
            rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hazard Type *
          </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {hazardTypes.map((type) => {
                      const Icon = type.icon
                      return (
              <button
                          key={type.value}
                          onClick={() => setFormData(prev => ({ ...prev, hazard_type: type.value }))}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            formData.hazard_type === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`h-6 w-6 ${type.color} mb-2`} />
                          <div className="text-sm font-medium text-gray-900">{type.label}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Severity & Location */}
          {currentStep === 2 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Severity & Location</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity Level *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {severityLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setFormData(prev => ({ ...prev, severity: level.value }))}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          formData.severity === level.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`text-sm font-medium px-3 py-1 rounded-full ${level.color}`}>
                          {level.label}
                </div>
              </button>
            ))}
          </div>
        </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
          </label>
          <div className="space-y-4">
                    <button
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      title="Get current location using GPS"
                      aria-label="Get current location using GPS"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {locationLoading ? 'Getting Location...' : 'Use Current Location'}
                    </button>

                    {formData.location.latitude !== 0 && formData.location.longitude !== 0 && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center text-green-800 mb-2">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Location Found
                        </div>
                        <div className="text-sm text-green-700">
                          {formData.location.address || `${formData.location.latitude}, ${formData.location.longitude}`}
                  </div>
              </div>
            )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="latitude-input" className="block text-xs font-medium text-gray-700 mb-1">Latitude</label>
                        <input
                          id="latitude-input"
                          type="number"
                          value={formData.location.latitude}
                          placeholder="Enter latitude"
                          title="Latitude"
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            location: { ...prev.location, latitude: parseFloat(e.target.value) || 0 }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          step="any"
                        />
                      </div>
                      <div>
                        <label htmlFor="longitude-input" className="block text-xs font-medium text-gray-700 mb-1">Longitude</label>
                        <input
                          id="longitude-input"
                          type="number"
                          value={formData.location.longitude}
                          placeholder="Enter longitude"
                          title="Longitude"
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            location: { ...prev.location, longitude: parseFloat(e.target.value) || 0 }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          step="any"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Media Upload */}
          {currentStep === 3 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Media Upload (Optional)</h2>
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-lg font-medium text-gray-900 mb-2">
                    Upload Photos or Videos
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    Help verify your report with visual evidence
                  </div>
            <input
              type="file"
              multiple
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
              className="hidden"
                    id="media-upload"
                  />
                  <label
                    htmlFor="media-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </label>
        </div>

                {formData.media_files.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">Selected Files:</h3>
                    {formData.media_files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Camera className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800"
                          title={`Remove ${file.name}`}
                          aria-label={`Remove ${file.name}`}
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Review & Submit</h2>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Report Summary</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Title:</span>
                      <span className="ml-2 text-sm text-gray-900">{formData.title}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Description:</span>
                      <p className="mt-1 text-sm text-gray-900">{formData.description}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Hazard Type:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {hazardTypes.find(t => t.value === formData.hazard_type)?.label}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Severity:</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        severityLevels.find(s => s.value === formData.severity)?.color
                      }`}>
                        {formData.severity}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Location:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {formData.location.address || `${formData.location.latitude}, ${formData.location.longitude}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Media Files:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {formData.media_files.length} file(s)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                      <h4 className="text-sm font-medium text-blue-900">Important Notice</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        Your report will be reviewed by our analysts before being verified. 
                        False reports may result in account restrictions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            )}

          {/* Navigation */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={submitReport}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
                    </button>
            )}
          </div>
        </div>
        </div>
    </div>
  )
}