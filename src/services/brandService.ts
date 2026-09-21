import { Brand } from '../types'
import { getStoredData, saveStoredData, initialBrands, generateId } from './mockDB'

export const brandService = {
  async getAll(): Promise<Brand[]> {
    const brands = getStoredData<Brand[]>('brands', initialBrands)
    return brands.sort((a, b) => a.name.localeCompare(b.name))
  },

  async getById(id: string): Promise<Brand> {
    const brands = getStoredData<Brand[]>('brands', initialBrands)
    const brand = brands.find(b => b.id === id)
    if (!brand) throw new Error('Brand not found')
    return brand
  },

  async create(name: string): Promise<Brand> {
    const brands = getStoredData<Brand[]>('brands', initialBrands)
    const existing = brands.find(b => b.name.toLowerCase() === name.trim().toLowerCase())
    if (existing) throw new Error('A brand with this name already exists')
    
    const now = new Date().toISOString()
    const newBrand: Brand = {
      id: generateId(),
      name: name.trim(),
      created_at: now,
      updated_at: now
    }
    brands.push(newBrand)
    saveStoredData('brands', brands)
    return newBrand
  },

  async update(id: string, name: string): Promise<Brand> {
    const brands = getStoredData<Brand[]>('brands', initialBrands)
    const index = brands.findIndex(b => b.id === id)
    if (index === -1) throw new Error('Brand not found')
    
    brands[index] = {
      ...brands[index],
      name: name.trim(),
      updated_at: new Date().toISOString()
    }
    saveStoredData('brands', brands)
    return brands[index]
  },

  async delete(id: string): Promise<void> {
    const brands = getStoredData<Brand[]>('brands', initialBrands)
    const filtered = brands.filter(b => b.id !== id)
    saveStoredData('brands', filtered)
  }
}
