import React, { useState, useEffect } from 'react'
import { SidebarLayout } from '../layouts/SidebarLayout'
import { brandService } from '../services/brandService'
import { productService } from '../services/productService'
import { Brand, Product } from '../types'
import { ConfirmationDialog } from '../components/ConfirmationDialog'
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Package
} from 'lucide-react'

interface BrandsPageProps {
  onNotify?: (msg: string, type: 'success' | 'error' | 'info') => void
}

export const BrandsPage: React.FC<BrandsPageProps> = ({ onNotify }) => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Add / Edit Modal
  const [brandNameInput, setBrandNameInput] = useState('')
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null)
  const [brandModalOpen, setBrandModalOpen] = useState(false)

  // Delete modal
  const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null)

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    try {
      const [brs, prods] = await Promise.all([
        brandService.getAll(),
        productService.getAll()
      ])
      setBrands(brs)
      setProducts(prods)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAdd = () => {
    setEditingBrandId(null)
    setBrandNameInput('')
    setBrandModalOpen(true)
  }

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrandId(brand.id)
    setBrandNameInput(brand.name)
    setBrandModalOpen(true)
  }

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brandNameInput.trim()) return

    try {
      if (editingBrandId) {
        await brandService.update(editingBrandId, brandNameInput.trim())
        onNotify?.('Brand updated successfully', 'success')
      } else {
        await brandService.create(brandNameInput.trim())
        onNotify?.('Brand added to store', 'success')
      }
      await loadBrands()
      setBrandModalOpen(false)
    } catch (e: any) {
      onNotify?.(e.message || 'Error saving brand', 'error')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteBrand) return
    try {
      await brandService.delete(deleteBrand.id)
      onNotify?.(`Brand "${deleteBrand.name}" deleted`, 'success')
      await loadBrands()
    } catch (e: any) {
      onNotify?.(e.message || 'Error deleting brand', 'error')
    } finally {
      setDeleteBrand(null)
    }
  }

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Brands</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Manage appliance & electrical manufacturers and brand names
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-indigo-600/25 transition-all cursor-pointer self-start"
          >
            <Plus size={16} />
            <span>Add Brand</span>
          </button>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : brands.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200/80">
              <Award size={36} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No brands added yet</p>
              <button
                onClick={handleOpenAdd}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                <Plus size={14} />
                Add First Brand
              </button>
            </div>
          ) : (
            brands.map((brand) => {
              const productCount = products.filter(p => p.brand_id === brand.id).length

              return (
                <div
                  key={brand.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-50 to-amber-100/80 text-amber-700 font-black flex items-center justify-center text-sm border border-amber-200/60 shadow-2xs">
                      {brand.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{brand.name}</h3>
                      <span className="text-[11px] font-medium text-slate-400">
                        {productCount} product{productCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(brand)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                      title="Edit Brand"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteBrand(brand)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Brand"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Add / Edit Brand Modal */}
      {brandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingBrandId ? 'Edit Brand' : 'Add New Brand'}
            </h3>
            <form onSubmit={handleSaveBrand} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Brand Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={brandNameInput}
                  onChange={(e) => setBrandNameInput(e.target.value)}
                  placeholder="e.g. Philips / Havells / Anchor"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBrandModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all"
                >
                  {editingBrandId ? 'Update Brand' : 'Add Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteBrand}
        title="Delete Brand"
        message={`Are you sure you want to delete brand "${deleteBrand?.name}"?`}
        confirmText="Yes, Delete Brand"
        cancelText="Cancel"
        isDestructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteBrand(null)}
      />
    </SidebarLayout>
  )
}
