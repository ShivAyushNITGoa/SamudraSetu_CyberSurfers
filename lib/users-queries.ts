import { supabase } from './supabase'
import { Profile } from './database'

export const getAllUsers = async (): Promise<Profile[]> => {
  try {
    console.log('Fetching all users...')
    
    // Try multiple approaches to get users
    let data: Profile[] = []
    let error: any = null

    // Approach 1: Simple select without ordering
    try {
      const { data: simpleData, error: simpleError } = await supabase
        .from('profiles')
        .select('*')
      
      if (!simpleError && simpleData) {
        console.log('Simple query successful:', simpleData.length, 'users')
        return simpleData
      }
      error = simpleError
    } catch (err) {
      console.log('Simple query failed:', err)
      error = err
    }

    // Approach 2: Select with specific columns
    try {
      const { data: columnData, error: columnError } = await supabase
        .from('profiles')
        .select('id, email, name, role, created_at, updated_at')
      
      if (!columnError && columnData) {
        console.log('Column query successful:', columnData.length, 'users')
        return columnData
      }
      error = columnError
    } catch (err) {
      console.log('Column query failed:', err)
      error = err
    }

    // Approach 3: Use RPC function if available
    try {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_all_profiles')
      
      if (!rpcError && rpcData) {
        console.log('RPC query successful:', rpcData.length, 'users')
        return rpcData
      }
      error = rpcError
    } catch (err) {
      console.log('RPC query failed:', err)
      error = err
    }

    // If all approaches fail, throw the last error
    if (error) {
      console.error('All query approaches failed. Last error:', error)
      throw error
    }

    return []
  } catch (error) {
    console.error('Error in getAllUsers:', error)
    throw error
  }
}

// Lightweight, paginated users query
export const getUsersPage = async (
  limit: number = 20,
  offset: number = 0
): Promise<Profile[]> => {
  try {
    // Attempt 1: minimal select ordered by created_at
    let { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, created_at, updated_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + Math.max(0, limit - 1))

    if (!error && data) return data

    // Attempt 2: remove order (in case column/index/RLS blocks ordering)
    ;({ data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, created_at, updated_at')
      .range(offset, offset + Math.max(0, limit - 1)))

    if (!error && data) return data

    // Attempt 3: wildcard select as last resort
    ;({ data, error } = await supabase
      .from('profiles')
      .select('*')
      .range(offset, offset + Math.max(0, limit - 1)))

    if (error) {
      const message = (error as any)?.message || 'Failed to fetch users'
      throw new Error(message)
    }
    return data || []
  } catch (error) {
    console.error('Error in getUsersPage:', error)
    throw error
  }
}

export const updateUserRole = async (userId: string, role: Profile['role']): Promise<Profile> => {
  try {
    console.log('Updating user role:', { userId, role })
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user role:', error)
      throw error
    }

    console.log('User role updated successfully:', data)
    return data
  } catch (error) {
    console.error('Error in updateUserRole:', error)
    throw error
  }
}