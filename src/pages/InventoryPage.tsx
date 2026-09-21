import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SidebarLayout } from '../layouts/SidebarLayout'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { brandService } from '../services/brandService'
import { Product, Category, Brand } from '../types'
import { SearchBar } from '../components/SearchBar'
import { FilterPanel } from '../components/FilterPanel'
import { StatusBadge } from '../components/StatusBadge'
import { StockControl } from '../components/StockControl'
import { ConfirmationDialog } from '../components/ConfirmationDialog'
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  FileSpreadsheet,
  PackageOpen,
  ArrowUpDown
} from 'lucide-react'

interface InventoryPageProps {
  onNotify?: (msg: string, type: 'success' | 'error' | 'info') => void
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ onNotify }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  // Search and Filter states
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedColour, setSelectedColour] = useState('')
  const [selectedStockStatus, setSelectedStockStatus] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all')

  // Modal / Actions state
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [cats, brs] = await Promise.all([
        categoryService.getAll(),
        brandService.getAll()
      ])
      setCategories(cats)
      setBrands(brs)
      await fetchFilteredProducts()
    } finally {
      setLoading(false)
    }
  }

  const fetchFilteredProducts = async () => {
    const prods = await productService.getAll({
      search,
      categoryId: selectedCategory,
      brandId: selectedBrand,
      colour: selectedColour,
      stockStatus: selectedStockStatus
    })
    setProducts(prods)
  }

  useEffect(() => {
    fetchFilteredProducts()
  }, [search, selectedCategory, selectedBrand, selectedColour, selectedStockStatus])

  // Get list of unique colors across all products
  const allColours = Array.from(new Set(products.map(p => p.colour).filter(Boolean)))

  const handleStockUpdate = async (productId: string, newQty: number) => {
    try {
      await productService.updateStock(productId, newQty)
      // Update local state instantly
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, quantity: newQty } : p))
      onNotify?.('Stock quantity updated', 'success')
    } catch (e: any) {
      onNotify?.(e.message || 'Failed to update stock', 'error')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteProductId) return
    try {
      await productService.delete(deleteProductId)
      setProducts(prev => prev.filter(p => p.id !== deleteProductId))
      onNotify?.('Product deleted from inventory', 'success')
    } catch (e: any) {
      onNotify?.(e.message || 'Failed to delete product', 'error')
    } finally {
      setDeleteProductId(null)
      setProductToDelete(null)
    }
  }

  const handleResetFilters = () => {
    setSelectedCategory('')
    setSelectedBrand('')
    setSelectedColour('')
    setSelectedStockStatus('all')
    setSearch('')
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Inventory Management</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Showing {products.length} product{products.length === 1 ? '' : 's'} in catalog
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/excel"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm border border-slate-200/80 shadow-xs transition-colors"
            >
              <FileSpreadsheet size={16} className="text-emerald-600" />
              <span>Excel Import/Export</span>
            </Link>
            <Link
              to="/inventory/add"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-indigo-600/25 transition-all"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by Product Name, Brand, Model Number, Colour..."
          />

          <FilterPanel
            categories={categories}
            brands={brands}
            colours={allColours}
            selectedCategory={selectedCategory}
            selectedBrand={selectedBrand}
            selectedColour={selectedColour}
            selectedStockStatus={selectedStockStatus}
            onCategoryChange={setSelectedCategory}
            onBrandChange={setSelectedBrand}
            onColourChange={setSelectedColour}
            onStockStatusChange={setSelectedStockStatus}
            onReset={handleResetFilters}
          />
        </div>

        {/* Main Inventory Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 px-4 text-center max-w-sm mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <PackageOpen size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No products found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {search || selectedCategory || selectedBrand || selectedColour || selectedStockStatus !== 'all'
                    ? 'Try adjusting your filters or search query.'
                    : 'Get started by adding your first product item.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                {(search || selectedCategory || selectedBrand || selectedColour || selectedStockStatus !== 'all') ? (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Clear All Filters
                  </button>
                ) : (
                  <Link
                    to="/inventory/add"
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all"
                  >
                    Add First Product
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Product</th>
                    <th className="py-3.5 px-4 font-bold">Category</th>
                    <th className="py-3.5 px-4 font-bold">Brand</th>
                    <th className="py-3.5 px-4 font-bold">Model</th>
                    <th className="py-3.5 px-4 font-bold">Colour</th>
                    <th className="py-3.5 px-4 font-bold text-center">Stock Quantity</th>
                    <th className="py-3.5 px-4 font-bold">Purchase</th>
                    <th className="py-3.5 px-4 font-bold">Selling</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/inventory/${p.id}`)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Product Name */}
                      <td className="py-4 px-4 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        <div className="max-w-[200px] truncate">
                          {p.product_name}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-xs font-semibold text-slate-600 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg">
                          {p.category?.name || '—'}
                        </span>
                      </td>

                      {/* Brand */}
                      <td className="py-4 px-4 text-xs font-bold text-slate-700 whitespace-nowrap">
                        {p.brand?.name || '—'}
                      </td>

                      {/* Model Number */}
                      <td className="py-4 px-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                        {p.model_number}
                      </td>

                      {/* Colour */}
                      <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-slate-300 shadow-2xs"
                            style={{ backgroundColor: p.colour.toLowerCase() === 'white' ? '#ffffff' : (p.colour.toLowerCase() === 'black' ? '#0f172a' : p.colour.toLowerCase()) }}
                          />
                          {p.colour}
                        </span>
                      </td>

                      {/* Stock Quantity + / - Control */}
                      <td className="py-4 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center justify-center">
                          <StockControl
                            quantity={p.quantity}
                            onUpdate={(newQty) => handleStockUpdate(p.id, newQty)}
                            compact
                          />
                        </div>
                      </td>

                      {/* Purchase Price */}
                      <td className="py-4 px-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                        ₹{p.purchase_price.toLocaleString()}
                      </td>

                      {/* Selling Price */}
                      <td className="py-4 px-4 text-sm font-bold text-slate-900 whitespace-nowrap">
                        ₹{p.selling_price.toLocaleString()}
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge quantity={p.quantity} threshold={p.low_stock_threshold} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/inventory/${p.id}`}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            to={`/inventory/${p.id}/edit`}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteProductId(p.id)
                              setProductToDelete(p)
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteProductId}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.product_name}" (${productToDelete?.model_number}) from inventory? This action cannot be undone.`}
        confirmText="Yes, Delete Product"
        cancelText="Cancel"
        isDestructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteProductId(null)
          setProductToDelete(null)
        }}
      />
    </SidebarLayout>
  )
}
