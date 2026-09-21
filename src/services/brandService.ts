import { supabase } from './supabase'
import { Brand } from '../types'

export const brandService = {
  async getAll(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching brands:', error)
      throw new Error(error.message)
    }

    return (data || []) as Brand[]
  },

  async getById(id: string): Promise<Brand> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Brand not found')
    }

    return data as Brand
  },

  async create(name: string): Promise<Brand> {
    const trimmed = name.trim()
    const { data, error } = await supabase
      .from('brands')
      .insert([{ name: trimmed }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('A brand with this name already exists')
      }
      throw new Error(error.message)
    }

    return data as Brand
  },

  async update(id: string, name: string): Promise<Brand> {
    const trimmed = name.trim()
    const { data, error } = await supabase
      .from('brands')
      .update({ name: trimmed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('A brand with this name already exists')
      }
      throw new Error(error.message)
    }

    return data as Brand
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }
}
