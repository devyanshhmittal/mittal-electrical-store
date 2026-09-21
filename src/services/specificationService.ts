import { CategorySpecification, ProductSpecification } from '../types'
import { getStoredData, saveStoredData, initialCategorySpecs, initialProductSpecs, generateId } from './mockDB'

export const specificationService = {
  async getByCategory(categoryId: string): Promise<CategorySpecification[]> {
    const specs = getStoredData<CategorySpecification[]>('category_specs', initialCategorySpecs)
    return specs.filter(s => s.category_id === categoryId)
  },

  async create(spec: Omit<CategorySpecification, 'id' | 'created_at'>): Promise<CategorySpecification> {
    const specs = getStoredData<CategorySpecification[]>('category_specs', initialCategorySpecs)
    const newSpec: CategorySpecification = {
      ...spec,
      id: generateId(),
      created_at: new Date().toISOString()
    }
    specs.push(newSpec)
    saveStoredData('category_specs', specs)
    return newSpec
  },

  async update(id: string, spec: Partial<CategorySpecification>): Promise<CategorySpecification> {
    const specs = getStoredData<CategorySpecification[]>('category_specs', initialCategorySpecs)
    const index = specs.findIndex(s => s.id === id)
    if (index === -1) throw new Error('Specification not found')
    specs[index] = { ...specs[index], ...spec }
    saveStoredData('category_specs', specs)
    return specs[index]
  },

  async delete(id: string): Promise<void> {
    const specs = getStoredData<CategorySpecification[]>('category_specs', initialCategorySpecs)
    const filtered = specs.filter(s => s.id !== id)
    saveStoredData('category_specs', filtered)

    // Also delete any values associated with this specification
    const prodSpecs = getStoredData<ProductSpecification[]>('product_specs', initialProductSpecs)
    const filteredProdSpecs = prodSpecs.filter(ps => ps.specification_id !== id)
    saveStoredData('product_specs', filteredProdSpecs)
  }
}

export const productSpecificationService = {
  async getByProduct(productId: string): Promise<ProductSpecification[]> {
    const prodSpecs = getStoredData<ProductSpecification[]>('product_specs', initialProductSpecs)
    const catSpecs = getStoredData<CategorySpecification[]>('category_specs', initialCategorySpecs)
    
    return prodSpecs
      .filter(ps => ps.product_id === productId)
      .map(ps => ({
        ...ps,
        specification: catSpecs.find(cs => cs.id === ps.specification_id)
      }))
  },

  async upsert(productId: string, specificationId: string, value: string): Promise<void> {
    const prodSpecs = getStoredData<ProductSpecification[]>('product_specs', initialProductSpecs)
    const index = prodSpecs.findIndex(ps => ps.product_id === productId && ps.specification_id === specificationId)
    const now = new Date().toISOString()
    
    if (index >= 0) {
      prodSpecs[index] = {
        ...prodSpecs[index],
        value,
        updated_at: now
      }
    } else {
      prodSpecs.push({
        id: generateId(),
        product_id: productId,
        specification_id: specificationId,
        value,
        created_at: now,
        updated_at: now
      })
    }
    saveStoredData('product_specs', prodSpecs)
  },

  async deleteForProduct(productId: string): Promise<void> {
    const prodSpecs = getStoredData<ProductSpecification[]>('product_specs', initialProductSpecs)
    const filtered = prodSpecs.filter(ps => ps.product_id !== productId)
    saveStoredData('product_specs', filtered)
  }
}
