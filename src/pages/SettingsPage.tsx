import React, { useState } from 'react'
import { SidebarLayout } from '../layouts/SidebarLayout'
import { settingsService } from '../services/settingsService'
import { ShopSettings } from '../types'
import {
  Settings,
  Store,
  MapPin,
  Phone,
  Coins,
  Save,
  ShieldCheck,
  Zap,
  RotateCcw
} from 'lucide-react'

interface SettingsPageProps {
  onNotify?: (msg: string, type: 'success' | 'error' | 'info') => void
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNotify }) => {
  const [settings, setSettings] = useState<ShopSettings>(() => settingsService.getSettings())

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    settingsService.saveSettings(settings)
    onNotify?.('Shop settings saved successfully', 'success')
  }

  const handleResetDefaults = () => {
    localStorage.removeItem('mittal_store_categories')
    localStorage.removeItem('mittal_store_brands')
    localStorage.removeItem('mittal_store_products')
    localStorage.removeItem('mittal_store_category_specs')
    localStorage.removeItem('mittal_store_product_specs')
    localStorage.removeItem('mittal_store_stock_history')
    localStorage.removeItem('mittal_store_settings')
    onNotify?.('Store data reset to default demo inventory', 'info')
    setTimeout(() => {
      window.location.reload()
    }, 800)
  }

  return (
    <SidebarLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Shop Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Configure your store profile, currency format, and inventory defaults
          </p>
        </div>

        {/* Settings Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Store size={16} />
              </div>
              <h2 className="text-base font-bold text-slate-900">Shop Profile</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Store / Business Name
                </label>
                <div className="relative">
                  <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={settings.shopName}
                    onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Shop Address
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <textarea
                    rows={2}
                    value={settings.shopAddress}
                    onChange={(e) => setSettings({ ...settings, shopAddress: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={settings.phoneNumber}
                    onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Currency Symbol
                </label>
                <div className="relative">
                  <Coins size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Save size={14} />
                <span>Save Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Database & Reset Actions */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <RotateCcw size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Demo Data Management</h2>
              <p className="text-xs text-slate-500">Reset local store catalog to initial sample data</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Reset Demo Inventory Data</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Restores 6 sample categories, 9 brands, and 8 standard electrical products.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-2 bg-slate-200 hover:bg-rose-600 hover:text-white text-slate-800 font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
