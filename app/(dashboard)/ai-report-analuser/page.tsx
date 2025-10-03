"use client"

import { useEffect, useState } from 'react'

export default function AIReportAnaluserPage() {
  const predictionPlaceholder = '{ "wave_height_m": 2.3, ... }'
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [serviceStatus, setServiceStatus] = useState<{ available: boolean; capabilities?: string[] } | null>(null)
  const [activeTab, setActiveTab] = useState<'report' | 'social' | 'image' | 'prediction' | 'alerts' | 'batch'>('report')

  // Social media
  const [socialContent, setSocialContent] = useState("")
  const [socialPlatform, setSocialPlatform] = useState("twitter")

  // Image analysis
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageDescription, setImageDescription] = useState("")

  // Prediction
  const [predictionInput, setPredictionInput] = useState("{\n  \"wave_height_m\": 2.3,\n  \"wind_speed_kts\": 18,\n  \"tide_level_m\": 0.8,\n  \"sea_surface_temp_c\": 28.5,\n  \"region\": \"Chennai\"\n}")

  // Alerts
  const [alertData, setAlertData] = useState("{\n  \"hazard_type\": \"tsunami\",\n  \"severity\": \"high\",\n  \"location\": \"Chennai\",\n  \"advice\": \"Evacuate to higher ground immediately.\"\n}")
  const [alertLanguages, setAlertLanguages] = useState("en,hi,ta")

  // Batch
  const [batchReports, setBatchReports] = useState(`[
  { "title": "High waves spotted", "description": "Waves crashing over promenade.", "location": "Puducherry" },
  { "title": "Beach flooding", "description": "Water entered shops near beach road.", "location": "Chennai" }
]`)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/ai/gemini', { method: 'GET' })
        const json = await res.json()
        if (res.ok && json?.data) {
          setServiceStatus(json.data)
        } else {
          setServiceStatus({ available: false })
        }
      } catch {
        setServiceStatus({ available: false })
      }
    }
    checkStatus()
  }, [])

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_report',
          data: { title, description, location }
        })
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        throw new Error(json.error || 'Request failed')
      }
      setResult(json.data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeSocial = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_social_media',
          data: { content: socialContent, metadata: { platform: socialPlatform } }
        })
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Request failed')
      setResult(json.data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1] || '')
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const handleAnalyzeImage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const base64 = await toBase64(imageFile)
      const res = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_image',
          data: { imageData: base64, description: imageDescription }
        })
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Request failed')
      setResult(json.data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePrediction = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const currentData = JSON.parse(predictionInput)
      const res = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_prediction', data: { currentData } })
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Request failed')
      setResult(json.data)
    } catch (err: any) {
      setError(err.message || 'Invalid JSON or request failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAlerts = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const alertDataObj = JSON.parse(alertData)
      const languages = alertLanguages.split(',').map(s => s.trim()).filter(Boolean)
      const res = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_multilingual_alert', data: { alertData: alertDataObj, languages } })
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Request failed')
      setResult(json.data)
    } catch (err: any) {
      setError(err.message || 'Invalid input or request failed')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const reports = JSON.parse(batchReports)
      const res = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'batch_analyze', data: { reports } })
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Request failed')
      setResult(json.data)
    } catch (err: any) {
      setError(err.message || 'Invalid JSON or request failed')
    } finally {
      setLoading(false)
    }
  }

  const isServiceAvailable = serviceStatus?.available === true

  return (
    <div className="p-6">
      <div className="max-w-6xl">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 pt-6">
            <h1 className="text-3xl font-bold text-gray-900">AI Report Analyst</h1>
            <p className="text-gray-600 mt-2">Analyze a citizen report using Gemini AI. This uses the server-side API configured via `.env.local`.</p>
            {serviceStatus && (
              <div className="mt-3 flex items-center gap-3 text-sm">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${isServiceAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isServiceAvailable ? 'Gemini AI Available' : 'Gemini AI Unavailable'}
                </span>
                {Array.isArray(serviceStatus.capabilities) && serviceStatus.capabilities.length > 0 && (
                  <span className="text-gray-500">Capabilities: {serviceStatus.capabilities.join(', ')}</span>
                )}
              </div>
            )}
          </div>

          {/* Unavailable warning removed as per user request */}

          {/* Tabs */}
          <div className="mx-6 mt-6">
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 text-sm">
              {[
                { key: 'report', label: 'Report Analysis' },
                { key: 'social', label: 'Social Media' },
                { key: 'image', label: 'Image Analysis' },
                { key: 'prediction', label: 'Prediction' },
                { key: 'alerts', label: 'Multilingual Alerts' },
                { key: 'batch', label: 'Batch Reports' }
              ].map((t: any) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-3 py-1.5 rounded-md mr-1 ${activeTab === t.key ? 'bg-white border border-gray-200 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                  type="button"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Report Analysis */}
          {activeTab === 'report' && (
            <form onSubmit={handleAnalyze} className="m-6 grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short report title"
            required
                disabled={!isServiceAvailable}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the issue"
            required
                disabled={!isServiceAvailable}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Chennai, Marina Beach"
                disabled={!isServiceAvailable}
          />
        </div>

        <button
          type="submit"
              disabled={loading || !isServiceAvailable}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Analyzing…' : 'Analyze report'}
        </button>
            </form>
          )}

          {/* Social Media */}
          {activeTab === 'social' && (
            <form onSubmit={handleAnalyzeSocial} className="m-6 grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={socialContent}
                    onChange={(e) => setSocialContent(e.target.value)}
                    placeholder="Paste tweet or post content"
                    required
                    disabled={!isServiceAvailable}
                  />
                </div>
                <div>
                  <label htmlFor="social-platform" className="block text-sm font-medium text-gray-700">Platform</label>
                  <select
                    id="social-platform"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={socialPlatform}
                    onChange={(e) => setSocialPlatform(e.target.value)}
                    disabled={!isServiceAvailable}
                  >
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isServiceAvailable}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? 'Analyzing…' : 'Analyze social content'}
              </button>
            </form>
          )}

          {/* Image Analysis */}
          {activeTab === 'image' && (
            <form onSubmit={handleAnalyzeImage} className="m-6 grid gap-4">
              <div>
                <label htmlFor="image-file" className="block text-sm font-medium text-gray-700">Image file</label>
                <input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  className="mt-1"
                  title="Select an image file"
                  placeholder="Choose image"
                  disabled={!isServiceAvailable}
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null
                    setImageFile(f || null)
                    setImagePreview(f ? URL.createObjectURL(f) : null)
                  }}
                />
              </div>
              {imagePreview && (
                <img src={imagePreview} alt="preview" className="max-h-64 rounded-md border" />
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  placeholder="Context about the image"
                  disabled={!isServiceAvailable}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !isServiceAvailable || !imageFile}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? 'Analyzing…' : 'Analyze image'}
              </button>
            </form>
          )}

          {/* Prediction */}
          {activeTab === 'prediction' && (
            <form onSubmit={handleGeneratePrediction} className="m-6 grid gap-4">
              <div>
                <label htmlFor="prediction-current-data" className="block text-sm font-medium text-gray-700">Current data (JSON)</label>
                <textarea
                  id="prediction-current-data"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 h-48 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={predictionInput}
                  onChange={(e) => setPredictionInput(e.target.value)}
                  placeholder={predictionPlaceholder}
                  title="Provide current ocean conditions as JSON"
                  disabled={!isServiceAvailable}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !isServiceAvailable}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? 'Generating…' : 'Generate prediction'}
              </button>
            </form>
          )}

          {/* Multilingual Alerts */}
          {activeTab === 'alerts' && (
            <form onSubmit={handleGenerateAlerts} className="m-6 grid gap-4">
              <div>
                <label htmlFor="alerts-data" className="block text-sm font-medium text-gray-700">Alert data (JSON)</label>
                <textarea
                  id="alerts-data"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 h-40 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={alertData}
                  onChange={(e) => setAlertData(e.target.value)}
                  placeholder='{ "hazard_type": "tsunami", ... }'
                  title="Provide alert payload as JSON"
                  disabled={!isServiceAvailable}
                />
              </div>
              <div>
                <label htmlFor="alerts-languages" className="block text-sm font-medium text-gray-700">Languages (comma separated)</label>
                <input
                  id="alerts-languages"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={alertLanguages}
                  onChange={(e) => setAlertLanguages(e.target.value)}
                  placeholder="en,hi,ta"
                  title="Comma-separated list of language codes"
                  disabled={!isServiceAvailable}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !isServiceAvailable}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? 'Generating…' : 'Generate alerts'}
              </button>
            </form>
          )}

          {/* Batch */}
          {activeTab === 'batch' && (
            <form onSubmit={handleBatchAnalyze} className="m-6 grid gap-4">
              <div>
                <label htmlFor="batch-reports" className="block text-sm font-medium text-gray-700">
                  Reports (JSON array)
                </label>
                <textarea
                  id="batch-reports"
                  title="Paste a JSON array of reports"
                  placeholder='[{"report": "example"}]'
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 h-48 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={batchReports}
                  onChange={(e) => setBatchReports(e.target.value)}
                  disabled={!isServiceAvailable}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !isServiceAvailable}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? 'Analyzing…' : 'Analyze batch'}
              </button>
            </form>
          )}

          {error && (
            <div className="mx-6 mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
              {error}
            </div>
          )}

          {result && (
            <div className="mx-6 mb-6 grid gap-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Classification</h2>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">{JSON.stringify(result.hazard_classification, null, 2)}</pre>
              </div>
              {result.risk_assessment && (
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Risk Assessment</h2>
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">{JSON.stringify(result.risk_assessment, null, 2)}</pre>
                </div>
              )}
              {Array.isArray(result.recommendations) && result.recommendations.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Recommendations</h2>
                  <ul className="list-disc pl-5 text-sm text-gray-800">
                    {result.recommendations.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


