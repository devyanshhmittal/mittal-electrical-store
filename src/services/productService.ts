import { Product, StockHistory } from '../types'
import { getStoredData, saveStoredData, initialProducts, initialCategories, initialBrands, initialCategorySpecs, initialProductSpecs, initialStockHistory, generateId } from './mockDB'

export interface ProductFilterOptions {
  categoryId?: string
  brandId?: string
  colour?: string
  stockStatus?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  search?: string
}

export const productService = {
  async getAll(filters?: ProductFilterOptions): Promise<Product[]> {
    const rawProducts = getStoredData<Product[]>('products', initialProducts)
    const categories = getStoredData('categories', initialCategories)
    const brands = getStoredData('brands', initialBrands)
    const prodSpecs = getStoredData('product_specs', initialProductSpecs)
    const catSpecs = getStoredData('category_specs', initialCategorySpecs)

    // Attach relations
    let products: Product[] = rawProducts.map(p => {
      const category = categories.find(c => c.id === p.category_id)
      const brand = brands.find(b => b.id === p.brand_id)
      const specifications = prodSpecs
        .filter(ps => ps.product_id === p.id)
        .map(ps => ({
          ...ps,
          specification: catSpecs.find(cs => cs.id === ps.specification_id)
        }))

      return {
        ...p,
        category,
        brand,
        specifications
      }
    })

    // Filter by Category
    if (filters?.categoryId) {
      products = products.filter(p => p.category_id === filters.categoryId)
    }

    // Filter by Brand
    if (filters?.brandId) {
      products = products.filter(p => p.brand_id === filters.brandId)
    }

    // Filter by Colour
    if (filters?.colour) {
      products = products.filter(p => p.colour.toLowerCase() === filters.colour?.toLowerCase())
    }

    // Filter by Stock Status
    if (filters?.stockStatus && filters.stockStatus !== 'all') {
      products = products.filter(p => {
        if (filters.stockStatus === 'out_of_stock') return p.quantity === 0
        if (filters.stockStatus === 'low_stock') return p.quantity > 0 && p.quantity <= p.low_stock_threshold
        if (filters.stockStatus === 'in_stock') return p.quantity > p.low_stock_threshold
        return true
      })
    }

    // Filter by Search (Name, Brand, Model, Colour)
    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim()
      products = products.filter(p =>
        p.product_name.toLowerCase().includes(q) ||
        (p.brand?.name && p.brand.name.toLowerCase().includes(q)) ||
        p.model_number.toLowerCase().includes(q) ||
        p.colour.toLowerCase().includes(q)
      )
    }

    return products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  async getById(id: string): Promise<Product> {
    const products = await this.getAll()
    const product = products.find(p => p.id === id)
    if (!product) throw new Error('Product not found')
    return product
  },

  async checkDuplicate(categoryId: string, brandId: string, modelNumber: string, colour: string, excludeId?: string): Promise<Product | null> {
    const rawProducts = getStoredData<Product[]>('products', initialProducts)
    const match = rawProducts.find(p =>
      p.category_id === categoryId &&
      p.brand_id === brandId &&
      p.model_number.toLowerCase().trim() === modelNumber.toLowerCase().trim() &&
      p.colour.toLowerCase().trim() === colour.toLowerCase().trim() &&
      p.id !== excludeId
    )
    return match || null
  },

  async create(productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category' | 'brand' | 'specifications'>): Promise<Product> {
    const rawProducts = getStoredData<Product[]>('products', initialProducts)
    const now = new Date().toISOString()
    const newProduct: Product = {
      ...productData,
      id: generateId(),
      created_at: now,
      updated_at: now
    }
    rawProducts.push(newProduct)
    saveStoredData('products', rawProducts)

    // Record stock history
    if (newProduct.quantity > 0) {
      const history = getStoredData<StockHistory[]>('stock_history', initialStockHistory)
      history.unshift({
        id: generateId(),
        product_id: newProduct.id,
        product_name: newProduct.product_name,
        previous_quantity: 0,
        change_quantity: newProduct.quantity,
        new_quantity: newProduct.quantity,
        created_at: now
      })
      saveStoredData('stock_history', history)
    }

    return this.getById(newProduct.id)
  },

  async update(id: string, productData: Partial<Product>): Promise<Product> {
    const rawProducts = getStoredData<Product[]>('products', initialProducts)
    const index = rawProducts.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Product not found')

    rawProducts[index] = {
      ...rawProducts[index],
      ...productData,
      updated_at: new Date().toISOString()
    }
    saveStoredData('products', rawProducts)
    return this.getById(id)
  },

  async delete(id: string): Promise<void> {
    const rawProducts = getStoredData<Product[]>('products', initialProducts)
    const filtered = rawProducts.filter(p => p.id !== id)
    saveStoredData('products', filtered)
  },

  async updateStock(id: string, newQuantity: number): Promise<Product> {
    const rawProducts = getStoredData<Product[]>('products', initialProducts)
    const index = rawProducts.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Product not found')

    const previousQuantity = rawProducts[index].quantity
    const clampedQty = Math.max(0, newQuantity)
    const changeQuantity = clampedQty - previousQuantity

    rawProducts[index] = {
      ...rawProducts[index],
      quantity: clampedQty,
      updated_at: new Date().toISOString()
    }
    saveStoredData('products', rawProducts)

    // Save stock history
    if (changeQuantity !== 0) {
      const history = getStoredData<StockHistory[]>('stock_history', initialStockHistory)
      history.unshift({
        id: generateId(),
        product_id: id,
        product_name: rawProducts[index].product_name,
        previous_quantity: previousQuantity,
        change_quantity: changeQuantity,
        new_quantity: clampedQty,
        created_at: new Date().toISOString()
      })
      saveStoredData('stock_history', history)
    }

    return this.getById(id)
  },

  async getStockHistory(): Promise<StockHistory[]> {
    return getStoredData<StockHistory[]>('stock_history', initialStockHistory)
  }
}
