import { supabase } from './supabase'
import { CategorySpecification, ProductSpecification } from '../types'

export const specificationService = {
  async getByCategory(categoryId: string): Promise<CategorySpecification[]> {
    const { data, error } = await supabase
      .from('category_specifications')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching specs:', error)
      throw new Error(error.message)
    }

    return (data || []) as CategorySpecification[]
  },

  async create(spec: Omit<CategorySpecification, 'id' | 'created_at'>): Promise<CategorySpecification> {
    const { data, error } = await supabase
      .from('category_specifications')
      .insert([spec])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data as CategorySpecification
  },

  async update(id: string, spec: Partial<CategorySpecification>): Promise<CategorySpecification> {
    const { data, error } = await supabase
      .from('category_specifications')
      .update(spec)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data as CategorySpecification
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('category_specifications')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }
}

export const productSpecificationService = {
  async getByProduct(productId: string): Promise<ProductSpecification[]> {
    const { data, error } = await supabase
      .from('product_specifications')
      .select(`
        *,
        specification:category_specifications(*)
      `)
      .eq('product_id', productId)

    if (error) {
      console.error('Error fetching product specs:', error)
      throw new Error(error.message)
    }

    return (data || []) as ProductSpecification[]
  },

  async upsert(productId: string, specificationId: string, value: string): Promise<void> {
    const { error } = await supabase
      .from('product_specifications')
      .upsert(
        {
          product_id: productId,
          specification_id: specificationId,
          value,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'product_id,specification_id' }
      )

    if (error) {
      throw new Error(error.message)
    }
  },

  async deleteForProduct(productId: string): Promise<void> {
    const { error } = await supabase
      .from('product_specifications')
      .delete()
      .eq('product_id', productId)

    if (error) {
      throw new Error(error.message)
    }
  }
}
