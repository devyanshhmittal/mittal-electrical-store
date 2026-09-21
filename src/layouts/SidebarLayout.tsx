import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Layers,
  Award,
  FileSpreadsheet,
  Settings,
  LogOut,
  Menu,
  X,
  Zap
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

interface SidebarLayoutProps {
  children: React.ReactNode
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Inventory', to: '/inventory', icon: Package },
    { label: 'Categories', to: '/categories', icon: Layers },
    { label: 'Brands', to: '/brands', icon: Award },
    { label: 'Excel', to: '/excel', icon: FileSpreadsheet },
    { label: 'Settings', to: '/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white z-40 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center shadow-md">
            <Zap size={20} className="text-slate-950 fill-slate-950" />
          </div>
          <div>
            <span className="font-black tracking-tight text-white block text-sm">MITTAL</span>
            <span className="text-[10px] text-amber-400 font-semibold tracking-wider block uppercase">Electricals</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar Backdrop on Mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 bottom-0 w-64 bg-slate-900 text-slate-300 z-50 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800/80 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Zap size={22} className="text-slate-950 fill-slate-950" />
            </div>
            <div>
              <h1 className="font-black text-white text-base tracking-tight leading-tight">MITTAL</h1>
              <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">Electrical Store</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* User & Logout Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">Administrator</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@store.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-700/50"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
