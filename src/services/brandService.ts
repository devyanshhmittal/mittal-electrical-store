import { supabase } from './supabase'
import { Brand } from '../types'
import { getActiveUserId } from './authService'

export const brandService = {
  async getAll(): Promise<Brand[]> {
    const userId = getActiveUserId()
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching brands:', error)
      throw new Error(error.message)
    }

    return (data || []) as Brand[]
  },

  async getById(id: string): Promise<Brand> {
    const userId = getActiveUserId()
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Brand not found')
    }

    return data as Brand
  },

  async create(name: string): Promise<Brand> {
    const userId = getActiveUserId()
    const trimmed = name.trim()
    const { data, error } = await supabase
      .from('brands')
      .insert([{ name: trimmed, user_id: userId }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('A brand with this name already exists in your store')
      }
      throw new Error(error.message)
    }

    return data as Brand
  },

  async update(id: string, name: string): Promise<Brand> {
    const userId = getActiveUserId()
    const trimmed = name.trim()
    const { data, error } = await supabase
      .from('brands')
      .update({ name: trimmed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('A brand with this name already exists in your store')
      }
      throw new Error(error.message)
    }

    return data as Brand
  },

  async delete(id: string): Promise<void> {
    const userId = getActiveUserId()
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }
  }
}
