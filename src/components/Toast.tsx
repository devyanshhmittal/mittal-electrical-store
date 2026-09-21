import React from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const bg = {
          success: 'bg-emerald-600 text-white shadow-emerald-600/20',
          error: 'bg-rose-600 text-white shadow-rose-600/20',
          info: 'bg-indigo-600 text-white shadow-indigo-600/20'
        }[toast.type]

        const Icon = {
          success: CheckCircle2,
          error: AlertCircle,
          info: Info
        }[toast.type]

        return (
          <div
            key={toast.id}
            className={`${bg} px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-top-2`}
          >
            <div className="flex items-center gap-2.5">
              <Icon size={18} className="shrink-0" />
              <p className="text-sm font-medium leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
