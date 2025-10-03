'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function NewIssuePage() {
  const [title, setTitle] = useState('' as string)
  const [description, setDescription] = useState('' as string)
  const [category, setCategory] = useState('infrastructure' as string)
  const [priority, setPriority] = useState('medium' as string)
  const [coords, setCoords] = useState(null as {lat:number; lng:number} | null)
  const [submitting, setSubmitting] = useState(false as boolean)

  const detectLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
  }

  const submit = async () => {
    try {
      setSubmitting(true)
      const payload: any = {
        title,
        description,
        category,
        priority,
        status: 'pending',
        location: JSON.stringify(coords ? { latitude: coords.lat, longitude: coords.lng } : null),
        address: ''
      }
      const { error } = await supabase.from('ocean_hazard_reports').insert(payload)
      if (error) throw error
      toast.success('Issue created')
      window.location.href = '/issues'
    } catch (e) {
      toast.error('Failed to create issue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">New Issue</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the issue..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="issue-category" className="block text-sm font-medium text-gray-700">Category</label>
              <select id="issue-category" className="select" value={category} onChange={(e) => setCategory(e.target.value)} title="Select category">
                <option value="infrastructure">Infrastructure</option>
                <option value="environment">Environment</option>
                <option value="safety">Safety</option>
                <option value="transport">Transport</option>
                <option value="utilities">Utilities</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="issue-priority" className="block text-sm font-medium text-gray-700">Priority</label>
              <select id="issue-priority" className="select" value={priority} onChange={(e) => setPriority(e.target.value)} title="Select priority">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={detectLocation} className="btn btn-secondary">Use My Location</button>
            <div className="text-sm text-gray-600">{coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'No location selected'}</div>
          </div>
          <div className="flex items-center justify-end">
            <button onClick={submit} disabled={submitting || !title} className="btn btn-primary">{submitting ? 'Submitting...' : 'Create Issue'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}


