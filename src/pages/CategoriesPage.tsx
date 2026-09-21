import React, { useState, useEffect } from 'react'
import { SidebarLayout } from '../layouts/SidebarLayout'
import { categoryService } from '../services/categoryService'
import { specificationService } from '../services/specificationService'
import { Category, CategorySpecification } from '../types'
import { ConfirmationDialog } from '../components/ConfirmationDialog'
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Settings2,
  X,
  Save
} from 'lucide-react'

interface CategoriesPageProps {
  onNotify?: (msg: string, type: 'success' | 'error' | 'info') => void
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onNotify }) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)
  const [specsMap, setSpecsMap] = useState<Record<string, CategorySpecification[]>>({})
  const [loading, setLoading] = useState(true)

  // Add / Edit Category State
  const [categoryNameInput, setCategoryNameInput] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)

  // Add Specification State
  const [specModalCategoryId, setSpecModalCategoryId] = useState<string | null>(null)
  const [specFieldName, setSpecFieldName] = useState('')
  const [specFieldType, setSpecFieldType] = useState<'text' | 'number' | 'dropdown' | 'yes_no'>('text')
  const [specUnit, setSpecUnit] = useState('')
  const [specOptionsInput, setSpecOptionsInput] = useState('')

  // Delete category / spec modal
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null)
  const [deleteSpec, setDeleteSpec] = useState<{ categoryId: string; spec: CategorySpecification } | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const cats = await categoryService.getAll()
      setCategories(cats)
      // Pre-load specs for all
      const specsData: Record<string, CategorySpecification[]> = {}
      for (const cat of cats) {
        specsData[cat.id] = await specificationService.getByCategory(cat.id)
      }
      setSpecsMap(specsData)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddCategory = () => {
    setEditingCategoryId(null)
    setCategoryNameInput('')
    setCategoryModalOpen(true)
  }

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id)
    setCategoryNameInput(cat.name)
    setCategoryModalOpen(true)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryNameInput.trim()) return

    try {
      if (editingCategoryId) {
        await categoryService.update(editingCategoryId, categoryNameInput.trim())
        onNotify?.('Category updated successfully', 'success')
      } else {
        const created = await categoryService.create(categoryNameInput.trim())
        setSpecsMap(prev => ({ ...prev, [created.id]: [] }))
        onNotify?.('Category added successfully', 'success')
      }
      await loadCategories()
      setCategoryModalOpen(false)
    } catch (e: any) {
      onNotify?.(e.message || 'Error saving category', 'error')
    }
  }

  const handleDeleteCategoryConfirm = async () => {
    if (!deleteCategory) return
    try {
      await categoryService.delete(deleteCategory.id)
      onNotify?.(`Category "${deleteCategory.name}" removed`, 'success')
      await loadCategories()
    } catch (e: any) {
      onNotify?.(e.message || 'Failed to delete category', 'error')
    } finally {
      setDeleteCategory(null)
    }
  }

  const handleSaveSpecification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!specModalCategoryId || !specFieldName.trim()) return

    try {
      const options = specFieldType === 'dropdown'
        ? specOptionsInput.split(',').map(o => o.trim()).filter(Boolean)
        : undefined

      await specificationService.create({
        category_id: specModalCategoryId,
        field_name: specFieldName.trim(),
        field_type: specFieldType,
        unit: specUnit.trim() || undefined,
        options
      })

      const updatedSpecs = await specificationService.getByCategory(specModalCategoryId)
      setSpecsMap(prev => ({ ...prev, [specModalCategoryId]: updatedSpecs }))
      onNotify?.('Specification field added!', 'success')

      // Reset
      setSpecModalCategoryId(null)
      setSpecFieldName('')
      setSpecFieldType('text')
      setSpecUnit('')
      setSpecOptionsInput('')
    } catch (e: any) {
      onNotify?.(e.message || 'Error adding specification', 'error')
    }
  }

  const handleDeleteSpecConfirm = async () => {
    if (!deleteSpec) return
    try {
      await specificationService.delete(deleteSpec.spec.id)
      const updatedSpecs = await specificationService.getByCategory(deleteSpec.categoryId)
      setSpecsMap(prev => ({ ...prev, [deleteSpec.categoryId]: updatedSpecs }))
      onNotify?.('Specification removed', 'success')
    } catch (e: any) {
      onNotify?.(e.message || 'Error deleting specification', 'error')
    } finally {
      setDeleteSpec(null)
    }
  }

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Product Categories</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Manage shop categories and their custom dynamic specification fields
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddCategory}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-indigo-600/25 transition-all cursor-pointer self-start"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
              <Layers size={36} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No categories added yet</p>
              <button
                onClick={handleOpenAddCategory}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                <Plus size={14} />
                Create First Category
              </button>
            </div>
          ) : (
            categories.map((cat) => {
              const isExpanded = expandedCategoryId === cat.id
              const specs = specsMap[cat.id] || []

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
                >
                  {/* Category Header Row */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div
                      onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                      className="flex items-center gap-3 cursor-pointer flex-1 select-none"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Layers size={18} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                          {specs.length} custom specification{specs.length === 1 ? '' : 's'} configured
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                        title="Edit Category Name"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteCategory(cat)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors ml-1"
                        title="Manage Specifications"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Specifications Manager */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/60 p-5 space-y-4 animate-in fade-in-50 duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles size={14} className="text-amber-500" />
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Dynamic Specifications for {cat.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSpecModalCategoryId(cat.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                        >
                          <Plus size={12} />
                          <span>Add Specification</span>
                        </button>
                      </div>

                      {specs.length === 0 ? (
                        <div className="bg-white rounded-xl p-6 text-center border border-dashed border-slate-200 text-xs text-slate-400">
                          No category-specific specifications defined for {cat.name}.
                          <button
                            onClick={() => setSpecModalCategoryId(cat.id)}
                            className="block mx-auto text-indigo-600 font-bold mt-1 hover:underline"
                          >
                            + Add custom specification (e.g. Capacity, Wattage)
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {specs.map((spec) => (
                            <div
                              key={spec.id}
                              className="bg-white rounded-xl p-3 border border-slate-200/80 flex items-center justify-between shadow-2xs"
                            >
                              <div>
                                <span className="text-xs font-bold text-slate-900 block">
                                  {spec.field_name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium capitalize">
                                  Type: {spec.field_type} {spec.unit ? `(${spec.unit})` : ''}
                                  {spec.options && ` • [${spec.options.join(', ')}]`}
                                </span>
                              </div>
                              <button
                                onClick={() => setDeleteSpec({ categoryId: cat.id, spec })}
                                className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Remove Specification"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Add / Edit Category Dialog */}
      <ConfirmationDialog
        isOpen={categoryModalOpen}
        title={editingCategoryId ? 'Edit Category' : 'Add New Category'}
        message=""
        confirmText="Save Category"
        cancelText="Cancel"
        onConfirm={() => {}}
        onCancel={() => setCategoryModalOpen(false)}
      />

      {/* Custom Category Add/Edit Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingCategoryId ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={categoryNameInput}
                  onChange={(e) => setCategoryNameInput(e.target.value)}
                  placeholder="e.g. Fans / Coolers / Small Appliances"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all"
                >
                  {editingCategoryId ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Specification Modal */}
      {specModalCategoryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings2 size={18} className="text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Add Category Specification</h3>
              </div>
              <button
                onClick={() => setSpecModalCategoryId(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSpecification} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Field Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={specFieldName}
                  onChange={(e) => setSpecFieldName(e.target.value)}
                  placeholder="e.g. Capacity / Wattage / Energy Rating"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Field Type
                </label>
                <select
                  value={specFieldType}
                  onChange={(e) => setSpecFieldType(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
                >
                  <option value="text">Text (e.g. Storage / Roma / Material)</option>
                  <option value="number">Number (with optional unit)</option>
                  <option value="dropdown">Dropdown (pre-set options)</option>
                  <option value="yes_no">Yes / No (Boolean)</option>
                </select>
              </div>

              {specFieldType === 'number' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Unit (Optional)
                  </label>
                  <input
                    type="text"
                    value={specUnit}
                    onChange={(e) => setSpecUnit(e.target.value)}
                    placeholder="e.g. L / W / lm / sq.ft"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              )}

              {specFieldType === 'dropdown' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dropdown Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={specOptionsInput}
                    onChange={(e) => setSpecOptionsInput(e.target.value)}
                    placeholder="e.g. 1 Star, 2 Star, 3 Star, 4 Star, 5 Star"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSpecModalCategoryId(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all"
                >
                  Add Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteCategory?.name}"?`}
        confirmText="Yes, Delete Category"
        cancelText="Cancel"
        isDestructive
        onConfirm={handleDeleteCategoryConfirm}
        onCancel={() => setDeleteCategory(null)}
      />

      {/* Delete Specification Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteSpec}
        title="Delete Specification"
        message={`Are you sure you want to remove specification "${deleteSpec?.spec.field_name}"?`}
        confirmText="Remove Specification"
        cancelText="Cancel"
        isDestructive
        onConfirm={handleDeleteSpecConfirm}
        onCancel={() => setDeleteSpec(null)}
      />
    </SidebarLayout>
  )
}
