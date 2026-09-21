import { supabase } from './supabase'
import { Category } from '../types'
import { getActiveUserId } from './authService'

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const userId = getActiveUserId()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      throw new Error(error.message)
    }

    return (data || []) as Category[]
  },

  async getById(id: string): Promise<Category> {
    const userId = getActiveUserId()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Category not found')
    }

    return data as Category
  },

  async create(name: string): Promise<Category> {
    const userId = getActiveUserId()
    const trimmed = name.trim()
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: trimmed, user_id: userId }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('A category with this name already exists in your store')
      }
      throw new Error(error.message)
    }

    return data as Category
  },

  async update(id: string, name: string): Promise<Category> {
    const userId = getActiveUserId()
    const trimmed = name.trim()
    const { data, error } = await supabase
      .from('categories')
      .update({ name: trimmed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('A category with this name already exists in your store')
      }
      throw new Error(error.message)
    }

    return data as Category
  },

  async delete(id: string): Promise<void> {
    const userId = getActiveUserId()
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }
  }
}
