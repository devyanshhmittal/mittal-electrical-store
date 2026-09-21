import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { SidebarLayout } from '../layouts/SidebarLayout'
import { productService } from '../services/productService'
import { Product, StockHistory } from '../types'
import { StatusBadge } from '../components/StatusBadge'
import { StockControl } from '../components/StockControl'
import { ConfirmationDialog } from '../components/ConfirmationDialog'
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Package,
  Sparkles,
  History,
  TrendingUp,
  Tag,
  Boxes
} from 'lucide-react'

interface ProductDetailsPageProps {
  onNotify?: (msg: string, type: 'success' | 'error' | 'info') => void
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ onNotify }) => {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (id) {
      loadProduct(id)
    }
  }, [id])

  const loadProduct = async (productId: string) => {
    try {
      const [prod, allHistory] = await Promise.all([
        productService.getById(productId),
        productService.getStockHistory()
      ])
      setProduct(prod)
      setStockHistory(allHistory.filter(h => h.product_id === productId))
    } catch (e: any) {
      onNotify?.(e.message || 'Product not found', 'error')
      navigate('/inventory')
    } finally {
      setLoading(false)
    }
  }

  const handleStockUpdate = async (newQty: number) => {
    if (!product) return
    try {
      const updated = await productService.updateStock(product.id, newQty)
      setProduct(updated)
      const allHistory = await productService.getStockHistory()
      setStockHistory(allHistory.filter(h => h.product_id === product.id))
      onNotify?.('Stock quantity updated', 'success')
    } catch (e: any) {
      onNotify?.(e.message || 'Failed to update stock', 'error')
    }
  }

  const handleDelete = async () => {
    if (!product) return
    try {
      await productService.delete(product.id)
      onNotify?.('Product deleted successfully', 'success')
      navigate('/inventory')
    } catch (e: any) {
      onNotify?.(e.message || 'Failed to delete product', 'error')
    }
  }

  if (loading || !product) {
    return (
      <SidebarLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </SidebarLayout>
    )
  }

  const profitPerUnit = product.selling_price - product.purchase_price
  const marginPercentage = product.purchase_price > 0 ? ((profitPerUnit / product.purchase_price) * 100).toFixed(1) : 0
  const totalStockValue = product.quantity * product.purchase_price

  return (
    <SidebarLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/inventory"
              className="p-2 bg-white rounded-xl text-slate-500 hover:text-slate-900 border border-slate-200/80 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{product.product_name}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Model: <span className="font-mono font-bold text-slate-700">{product.model_number}</span> • Colour: <span className="font-bold text-slate-700">{product.colour}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/inventory/${product.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all"
            >
              <Edit2 size={14} />
              <span>Edit Product</span>
            </Link>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="p-2.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200/80 transition-colors shadow-xs"
              title="Delete Product"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Top Product Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Package size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Product Overview</h2>
                  <p className="text-xs text-slate-500">Core identification & stock status</p>
                </div>
              </div>
              <StatusBadge quantity={product.quantity} threshold={product.low_stock_threshold} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Category</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">{product.category?.name || '—'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Brand</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">{product.brand?.name || '—'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Colour</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">{product.colour}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Purchase Price</span>
                <span className="text-sm font-extrabold text-slate-800 mt-1 block">₹{product.purchase_price.toLocaleString()}</span>
              </div>

              <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">Selling Price</span>
                <span className="text-sm font-extrabold text-indigo-700 mt-1 block">₹{product.selling_price.toLocaleString()}</span>
              </div>

              <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Profit / Unit</span>
                <span className="text-sm font-extrabold text-emerald-700 mt-1 block">
                  +₹{profitPerUnit.toLocaleString()} <span className="text-[10px] font-semibold">({marginPercentage}%)</span>
                </span>
              </div>
            </div>

            {/* Live Stock Management Bar */}
            <div className="p-5 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Current Stock</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-slate-900">{product.quantity}</span>
                  <span className="text-xs font-bold text-slate-500">physical units</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StockControl
                  quantity={product.quantity}
                  onUpdate={handleStockUpdate}
                />
              </div>
            </div>
          </div>

          {/* Side Valuation Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Inventory Valuation</h3>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Total Cost Value</span>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">₹{totalStockValue.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium">Potential Retail Value</span>
                  <p className="text-xl font-bold text-indigo-600 mt-0.5">₹{(product.quantity * product.selling_price).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium">Reorder Threshold</span>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">{product.low_stock_threshold} units</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
              Created on {new Date(product.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Bottom Section: Specifications & Stock History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Specifications */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles size={16} className="text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Technical Specifications</h3>
            </div>

            {(!product.specifications || product.specifications.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No extra category specifications specified for this product item.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {product.specifications.map((spec) => (
                  <div key={spec.id} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">
                      {spec.specification?.field_name || 'Specification'}
                    </span>
                    <span className="font-bold text-slate-900 text-right">
                      {spec.value} {spec.specification?.unit ? spec.specification.unit : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Simple Stock Change History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <History size={16} className="text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Stock History Log</h3>
            </div>

            {stockHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No manual stock changes recorded yet.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {stockHistory.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {h.previous_quantity} → {h.new_quantity} units
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(h.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <span className={`font-black px-2 py-0.5 rounded-md ${
                      h.change_quantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {h.change_quantity > 0 ? `+${h.change_quantity}` : h.change_quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={deleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${product.product_name}" from inventory?`}
        confirmText="Yes, Delete Product"
        cancelText="Cancel"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </SidebarLayout>
  )
}
