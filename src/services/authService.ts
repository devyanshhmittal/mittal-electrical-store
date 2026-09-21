import { User } from '../types'

export const authService = {
  async signUp(email: string, _password: string): Promise<{ user: User }> {
    const user: User = { id: `user-${Date.now()}`, email }
    localStorage.setItem('mittal_store_auth_user', JSON.stringify(user))
    return { user }
  },

  async signIn(email: string, _password: string): Promise<{ user: User }> {
    const user: User = { id: `user-${Date.now()}`, email }
    localStorage.setItem('mittal_store_auth_user', JSON.stringify(user))
    return { user }
  },

  async signOut(): Promise<void> {
    localStorage.removeItem('mittal_store_auth_user')
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const stored = localStorage.getItem('mittal_store_auth_user')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      // fallback
    }
    return null
  }
}
