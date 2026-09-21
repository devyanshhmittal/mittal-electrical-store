import { Category } from '../types'
import { getStoredData, saveStoredData, initialCategories, generateId } from './mockDB'

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const categories = getStoredData<Category[]>('categories', initialCategories)
    return categories.sort((a, b) => a.name.localeCompare(b.name))
  },

  async getById(id: string): Promise<Category> {
    const categories = getStoredData<Category[]>('categories', initialCategories)
    const category = categories.find(c => c.id === id)
    if (!category) throw new Error('Category not found')
    return category
  },

  async create(name: string): Promise<Category> {
    const categories = getStoredData<Category[]>('categories', initialCategories)
    const existing = categories.find(c => c.name.toLowerCase() === name.trim().toLowerCase())
    if (existing) throw new Error('A category with this name already exists')
    
    const now = new Date().toISOString()
    const newCategory: Category = {
      id: generateId(),
      name: name.trim(),
      created_at: now,
      updated_at: now
    }
    categories.push(newCategory)
    saveStoredData('categories', categories)
    return newCategory
  },

  async update(id: string, name: string): Promise<Category> {
    const categories = getStoredData<Category[]>('categories', initialCategories)
    const index = categories.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Category not found')
    
    categories[index] = {
      ...categories[index],
      name: name.trim(),
      updated_at: new Date().toISOString()
    }
    saveStoredData('categories', categories)
    return categories[index]
  },

  async delete(id: string): Promise<void> {
    const categories = getStoredData<Category[]>('categories', initialCategories)
    const filtered = categories.filter(c => c.id !== id)
    saveStoredData('categories', filtered)
  }
}
