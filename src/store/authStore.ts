import { create } from 'zustand'
import { User } from '../types'

interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem('mittal_store_auth_user')
      return stored ? JSON.parse(stored) : { id: 'user-default', email: 'admin@mittalelectrical.com' }
    } catch {
      return { id: 'user-default', email: 'admin@mittalelectrical.com' }
    }
  })(),
  loading: false,
  setUser: (user) => {
    if (user) {
      localStorage.setItem('mittal_store_auth_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('mittal_store_auth_user')
    }
    set({ user, loading: false })
  },
  setLoading: (loading) => set({ loading }),
  logout: () => {
    localStorage.removeItem('mittal_store_auth_user')
    set({ user: null, loading: false })
  }
}))
