import { supabase } from './supabase'
import { CategorySpecification, ProductSpecification } from '../types'
import { getActiveUserId } from './authService'

export const specificationService = {
  async getByCategory(categoryId: string): Promise<CategorySpecification[]> {
    const userId = getActiveUserId()
    const { data, error } = await supabase
      .from('category_specifications')
      .select('*')
      .eq('category_id', categoryId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching specs:', error)
      throw new Error(error.message)
    }

    return (data || []) as CategorySpecification[]
  },

  async create(spec: Omit<CategorySpecification, 'id' | 'created_at'>): Promise<CategorySpecification> {
    const userId = getActiveUserId()
    const { data, error } = await supabase
      .from('category_specifications')
      .insert([{ ...spec, user_id: userId }])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data as CategorySpecification
  },

  async update(id: string, spec: Partial<CategorySpecification>): Promise<CategorySpecification> {
    const userId = getActiveUserId()
    const { data, error } = await supabase
      .from('category_specifications')
      .update(spec)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data as CategorySpecification
  },

  async delete(id: string): Promise<void> {
    const userId = getActiveUserId()
    const { error } = await supabase
      .from('category_specifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }
  }
}

export const productSpecificationService = {
  async getByProduct(productId: string): Promise<ProductSpecification[]> {
    const userId = getActiveUserId()
    const { data, error } = await supabase
      .from('product_specifications')
      .select(`
        *,
        specification:category_specifications(*)
      `)
      .eq('product_id', productId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching product specs:', error)
      throw new Error(error.message)
    }

    return (data || []) as ProductSpecification[]
  },

  async upsert(productId: string, specificationId: string, value: string): Promise<void> {
    const userId = getActiveUserId()
    const { error } = await supabase
      .from('product_specifications')
      .upsert(
        {
          product_id: productId,
          specification_id: specificationId,
          value,
          user_id: userId,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'product_id,specification_id' }
      )

    if (error) {
      throw new Error(error.message)
    }
  },

  async deleteForProduct(productId: string): Promise<void> {
    const userId = getActiveUserId()
    const { error } = await supabase
      .from('product_specifications')
      .delete()
      .eq('product_id', productId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }
  }
}
