import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SidebarLayout } from '../layouts/SidebarLayout'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { Product, Category } from '../types'
import {
  Package,
  Boxes,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const [prods, cats] = await Promise.all([
        productService.getAll(),
        categoryService.getAll()
      ])
      setProducts(prods)
      setCategories(cats)
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err)
      setFetchError(err?.message || 'Failed to connect to database')
    } finally {
      setLoading(false)
    }
  }

  // Dashboard Calculations
  const totalProductsCount = products.length
  const totalStockUnits = products.reduce((sum, p) => sum + p.quantity, 0)
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= p.low_stock_threshold).length
  const outOfStockCount = products.filter(p => p.quantity === 0).length
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.quantity * p.purchase_price), 0)

  // Category breakdown
  const categorySummary = categories.map(cat => {
    const catProducts = products.filter(p => p.category_id === cat.id)
    const units = catProducts.reduce((sum, p) => sum + p.quantity, 0)
    const count = catProducts.length
    return {
      category: cat,
      units,
      count
    }
  })

  // Recent 5 products
  const recentProducts = products.slice(0, 5)

  if (loading) {
    return (
      <SidebarLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </SidebarLayout>
    )
  }

  if (fetchError) {
    return (
      <SidebarLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-lg font-bold ml-3">{fetchError}</div>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="space-y-8">
        {/* Error Alert if any */}
        {fetchError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4 text-rose-800 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-rose-600" />
              <span>Database Connection Notice: {fetchError}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-slate-800">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={12} />
              Store Overview
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Inventory Dashboard</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Real-time stock analytics, category summaries, and quick product overview for Mittal Electrical Store.
            </p>
          </div>
          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <Link
              to="/inventory/add"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus size={18} />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* 5 Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Unique Products */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Items</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Package size={18} />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">{totalProductsCount}</span>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Unique products</p>
            </div>
          </div>

          {/* Total Stock in Units */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Stock</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Boxes size={18} />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-blue-600 tracking-tight">{totalStockUnits.toLocaleString()}</span>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Physical units</p>
            </div>
          </div>

          {/* Low Stock Warning */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-amber-600 tracking-tight">{lowStockCount}</span>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Need reorder</p>
            </div>
          </div>

          {/* Out of Stock Alert */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Out of Stock</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle size={18} />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-rose-600 tracking-tight">{outOfStockCount}</span>
              <p className="text-xs font-medium text-slate-500 mt-0.5">0 units remaining</p>
            </div>
          </div>

          {/* Inventory Valuation */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory Value</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">₹{totalInventoryValue.toLocaleString()}</span>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Purchase cost basis</p>
            </div>
          </div>
        </div>

        {/* Section 2: Category Summary + Recent Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Category Summary List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Category Summary</h2>
                <p className="text-xs text-slate-500">Units in stock by product category</p>
              </div>
              <Link to="/categories" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
                Manage
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {categorySummary.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No categories added</p>
              ) : (
                categorySummary.map(({ category, units, count }) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 transition-colors"
                  >
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">{category.name}</span>
                      <span className="text-xs font-medium text-slate-500">{count} product models</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-indigo-600 block">{units.toLocaleString()} units</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Products Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recently Added Products</h2>
                <p className="text-xs text-slate-500">Latest inventory items in the store</p>
              </div>
              <Link to="/inventory" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
                View All
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                    <th className="pb-3 font-bold">Product</th>
                    <th className="pb-3 font-bold">Category</th>
                    <th className="pb-3 font-bold">Brand</th>
                    <th className="pb-3 font-bold text-center">Stock</th>
                    <th className="pb-3 font-bold text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                        No products added yet.
                      </td>
                    </tr>
                  ) : (
                    recentProducts.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-3.5 pr-3">
                          <Link to={`/inventory/${p.id}`} className="font-bold text-slate-900 hover:text-indigo-600 block">
                            {p.product_name}
                          </Link>
                          <span className="text-xs font-medium text-slate-500">{p.model_number} • {p.colour}</span>
                        </td>
                        <td className="py-3.5 pr-3 text-slate-600 text-xs font-semibold">{p.category?.name || '—'}</td>
                        <td className="py-3.5 pr-3 text-slate-600 text-xs font-semibold">{p.brand?.name || '—'}</td>
                        <td className="py-3.5 pr-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            p.quantity === 0
                              ? 'bg-rose-50 text-rose-700'
                              : p.quantity <= p.low_stock_threshold
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {p.quantity} units
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-bold text-slate-900">₹{p.selling_price.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2">
              <Link
                to="/inventory"
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs transition-colors border border-slate-200/80"
              >
                <span>Go to Full Inventory Management</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
