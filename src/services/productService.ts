import { supabase } from './supabase'
import { Product, StockHistory } from '../types'
import { getActiveUserId } from './authService'

export interface ProductFilterOptions {
  categoryId?: string
  brandId?: string
  colour?: string
  stockStatus?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  search?: string
}

export const productService = {
  async getAll(filters?: ProductFilterOptions): Promise<Product[]> {
    const userId = getActiveUserId()
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        brand:brands(*),
        specifications:product_specifications(
          *,
          specification:category_specifications(*)
        )
      `)
      .eq('user_id', userId)

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }

    if (filters?.brandId) {
      query = query.eq('brand_id', filters.brandId)
    }

    if (filters?.colour) {
      query = query.ilike('colour', filters.colour.trim())
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading products from Supabase:', error)
      throw new Error(error.message)
    }

    let products = (data || []) as Product[]

    // Client-side filtering for stock status
    if (filters?.stockStatus && filters.stockStatus !== 'all') {
      products = products.filter(p => {
        if (filters.stockStatus === 'out_of_stock') return p.quantity === 0
        if (filters.stockStatus === 'low_stock') return p.quantity > 0 && p.quantity <= p.low_stock_threshold
        if (filters.stockStatus === 'in_stock') return p.quantity > p.low_stock_threshold
        return true
      })
    }

    // Client-side filtering for search query
    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim()
      products = products.filter(p =>
        p.product_name.toLowerCase().includes(q) ||
        (p.brand?.name && p.brand.name.toLowerCase().includes(q)) ||
        p.model_number.toLowerCase().includes(q) ||
        p.colour.toLowerCase().includes(q)
      )
    }

    return products
  },

  async getById(id: string): Promise<Product> {
    const userId = getActiveUserId()
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        brand:brands(*),
        specifications:product_specifications(
          *,
          specification:category_specifications(*)
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Product not found')
    }

    return data as Product
  },

  async checkDuplicate(categoryId: string, brandId: string, modelNumber: string, colour: string, excludeId?: string): Promise<Product | null> {
    const userId = getActiveUserId()
    let query = supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .eq('brand_id', brandId)
      .ilike('model_number', modelNumber.trim())
      .ilike('colour', colour.trim())

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error checking duplicate:', error)
      return null
    }

    return (data && data.length > 0) ? (data[0] as Product) : null
  },

  async create(productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category' | 'brand' | 'specifications'>): Promise<Product> {
    const userId = getActiveUserId()
    const { data, error } = await supabase
      .from('products')
      .insert([{
        product_name: productData.product_name,
        category_id: productData.category_id,
        brand_id: productData.brand_id,
        model_number: productData.model_number,
        colour: productData.colour,
        quantity: productData.quantity,
        purchase_price: productData.purchase_price,
        selling_price: productData.selling_price,
        low_stock_threshold: productData.low_stock_threshold || 5,
        image_url: productData.image_url || '',
        user_id: userId
      }])
      .select()
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create product')
    }

    // Record initial stock history
    if (data.quantity > 0) {
      await supabase.from('stock_history').insert([{
        product_id: data.id,
        product_name: data.product_name,
        previous_quantity: 0,
        change_quantity: data.quantity,
        new_quantity: data.quantity,
        user_id: userId
      }])
    }

    return this.getById(data.id)
  },

  async update(id: string, productData: Partial<Product>): Promise<Product> {
    const userId = getActiveUserId()
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (productData.product_name !== undefined) payload.product_name = productData.product_name
    if (productData.category_id !== undefined) payload.category_id = productData.category_id
    if (productData.brand_id !== undefined) payload.brand_id = productData.brand_id
    if (productData.model_number !== undefined) payload.model_number = productData.model_number
    if (productData.colour !== undefined) payload.colour = productData.colour
    if (productData.quantity !== undefined) payload.quantity = productData.quantity
    if (productData.purchase_price !== undefined) payload.purchase_price = productData.purchase_price
    if (productData.selling_price !== undefined) payload.selling_price = productData.selling_price
    if (productData.low_stock_threshold !== undefined) payload.low_stock_threshold = productData.low_stock_threshold
    if (productData.image_url !== undefined) payload.image_url = productData.image_url

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }

    return this.getById(id)
  },

  async delete(id: string): Promise<void> {
    const userId = getActiveUserId()
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }
  },

  async updateStock(id: string, newQuantity: number): Promise<Product> {
    const userId = getActiveUserId()
    const currentProduct = await this.getById(id)
    const previousQuantity = currentProduct.quantity
    const clampedQty = Math.max(0, newQuantity)
    const changeQuantity = clampedQty - previousQuantity

    const { error } = await supabase
      .from('products')
      .update({
        quantity: clampedQty,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }

    // Save stock history log
    if (changeQuantity !== 0) {
      await supabase.from('stock_history').insert([{
        product_id: id,
        product_name: currentProduct.product_name,
        previous_quantity: previousQuantity,
        change_quantity: changeQuantity,
        new_quantity: clampedQty,
        user_id: userId
      }])
    }

    return this.getById(id)
  },

  async getStockHistory(): Promise<StockHistory[]> {
    const userId = getActiveUserId()
    const { data, error } = await supabase
      .from('stock_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading stock history:', error)
      return []
    }

    return (data || []) as StockHistory[]
  }
}
