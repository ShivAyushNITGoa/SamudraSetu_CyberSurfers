import { supabase } from '@/lib/supabase'

export async function uploadReportImages(files: File[], userId: string): Promise<string[]> {
  if (!files.length) return []
  const bucket = 'reports'
  const uploadedUrls: string[] = []

  // Upload sequentially for simplicity and better error handling
  for (const file of files) {
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) throw error

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    if (data?.publicUrl) uploadedUrls.push(data.publicUrl)
  }

  return uploadedUrls
}


