import React from 'react'
import { Plus, Minus } from 'lucide-react'

interface StockControlProps {
  quantity: number
  onUpdate: (newQuantity: number) => void
  compact?: boolean
}

export const StockControl: React.FC<StockControlProps> = ({ quantity, onUpdate, compact = false }) => {
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (quantity > 0) {
      onUpdate(quantity - 1)
    }
  }

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation()
    onUpdate(quantity + 1)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val) && val >= 0) {
      onUpdate(val)
    } else if (e.target.value === '') {
      onUpdate(0)
    }
  }

  if (compact) {
    return (
      <div className="inline-flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 shadow-sm" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={quantity <= 0}
          className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
          title="Decrease Stock"
        >
          <Minus size={12} />
        </button>
        <input
          type="number"
          value={quantity}
          onChange={handleChange}
          onClick={e => e.stopPropagation()}
          className="w-10 text-center text-xs font-bold text-slate-800 bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5"
        />
        <button
          type="button"
          onClick={handleIncrement}
          className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:bg-white hover:text-slate-900 transition-all"
          title="Increase Stock"
        >
          <Plus size={12} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-sm" onClick={e => e.stopPropagation()}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= 0}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-xs"
        title="Decrease Stock"
      >
        <Minus size={14} />
      </button>
      <input
        type="number"
        value={quantity}
        onChange={handleChange}
        onClick={e => e.stopPropagation()}
        className="w-14 text-center text-sm font-bold text-slate-900 bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 border border-transparent rounded-lg py-1 transition-all"
      />
      <button
        type="button"
        onClick={handleIncrement}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-xs"
        title="Increase Stock"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}
