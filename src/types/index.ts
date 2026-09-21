export interface Category {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface CategorySpecification {
  id: string
  category_id: string
  field_name: string
  field_type: 'text' | 'number' | 'dropdown' | 'yes_no'
  unit?: string
  options?: string[]
  required?: boolean
  created_at: string
}

export interface ProductSpecification {
  id: string
  product_id: string
  specification_id: string
  value: string
  created_at: string
  updated_at: string
  specification?: CategorySpecification
}

export interface Product {
  id: string
  product_name: string
  category_id: string
  brand_id: string
  model_number: string
  colour: string
  quantity: number
  purchase_price: number
  selling_price: number
  image_url?: string
  low_stock_threshold: number
  created_at: string
  updated_at: string
  category?: Category
  brand?: Brand
  specifications?: ProductSpecification[]
}

export interface StockHistory {
  id: string
  product_id: string
  product_name?: string
  previous_quantity: number
  change_quantity: number
  new_quantity: number
  created_at: string
}

export interface ShopSettings {
  shopName: string
  shopAddress: string
  phoneNumber: string
  currency: string
}

export interface User {
  id: string
  email: string
}
