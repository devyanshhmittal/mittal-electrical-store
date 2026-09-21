import React from 'react'
import { Category, Brand } from '../types'
import { Filter, RotateCcw } from 'lucide-react'

interface FilterPanelProps {
  categories: Category[]
  brands: Brand[]
  colours: string[]
  selectedCategory: string
  selectedBrand: string
  selectedColour: string
  selectedStockStatus: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  onCategoryChange: (catId: string) => void
  onBrandChange: (brandId: string) => void
  onColourChange: (colour: string) => void
  onStockStatusChange: (status: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock') => void
  onReset: () => void
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  categories,
  brands,
  colours,
  selectedCategory,
  selectedBrand,
  selectedColour,
  selectedStockStatus,
  onCategoryChange,
  onBrandChange,
  onColourChange,
  onStockStatusChange,
  onReset
}) => {
  const hasActiveFilters = selectedCategory || selectedBrand || selectedColour || selectedStockStatus !== 'all'

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Category Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Brand Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Brand</label>
          <select
            value={selectedBrand}
            onChange={(e) => onBrandChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Colour Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Colour</label>
          <select
            value={selectedColour}
            onChange={(e) => onColourChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
          >
            <option value="">All Colours</option>
            {colours.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        {/* Stock Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Stock Status</label>
          <select
            value={selectedStockStatus}
            onChange={(e) => onStockStatusChange(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
          >
            <option value="all">All Stock Levels</option>
            <option value="in_stock">🟢 In Stock</option>
            <option value="low_stock">🟡 Low Stock</option>
            <option value="out_of_stock">🔴 Out of Stock</option>
          </select>
        </div>
      </div>
    </div>
  )
}
