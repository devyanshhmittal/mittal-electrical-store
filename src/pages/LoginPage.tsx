import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { Zap, ArrowRight, ShieldCheck } from 'lucide-react'

interface LoginPageProps {
  onNotify?: (msg: string, type: 'success' | 'error' | 'info') => void
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNotify }) => {
  const [email, setEmail] = useState('admin@mittalelectrical.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      onNotify?.('Please enter your email and password', 'error')
      return
    }

    setLoading(true)
    try {
      const { user } = await authService.signIn(email, password)
      setUser(user)
      onNotify?.('Welcome back! Login successful', 'success')
      navigate('/dashboard')
    } catch (err: any) {
      onNotify?.(err.message || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async () => {
    if (!email || !password) {
      onNotify?.('Please enter email and password to create an account', 'error')
      return
    }

    setLoading(true)
    try {
      const { user } = await authService.signUp(email, password)
      setUser(user)
      onNotify?.('Account created successfully! Welcome to Mittal Electricals', 'success')
      navigate('/dashboard')
    } catch (err: any) {
      onNotify?.(err.message || 'Account creation failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Brand Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 shadow-xl shadow-amber-500/20 mb-4">
            <Zap size={32} className="text-slate-950 fill-slate-950" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">MITTAL</h1>
          <p className="text-amber-400 font-bold tracking-widest text-xs uppercase mt-0.5">Electrical Store</p>
          <p className="text-slate-400 text-sm mt-2">Inventory Management & Stock Control</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@store.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer text-sm"
            >
              <span>{loading ? 'Signing In...' : 'Sign In to Dashboard'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleCreateAccount}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Create New Admin Account
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-600 font-medium">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Standalone Local Storage — No Cloud Database Required</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © {new Date().getFullYear()} Mittal Electrical Store. All rights reserved.
        </p>
      </div>
    </div>
  )
}
