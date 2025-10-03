'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

type Toast = { id: string; message: string; type?: 'info'|'success'|'error' }
const ToastContext = createContext<{ push: (t: Omit<Toast,'id'>) => void } | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('ToastContext not available')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((t: Omit<Toast,'id'>) => {
    const toast: Toast = { id: Math.random().toString(36).slice(2), ...t }
    setToasts(prev => [...prev, toast])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== toast.id)), 3000)
  }, [])
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-[2000]">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-2 rounded shadow text-white ${t.type==='error'?'bg-red-600':t.type==='success'?'bg-green-600':'bg-gray-800'}`}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}


