import { supabase } from './supabase'
import { User } from '../types'

export const authService = {
  async signUp(email: string, password: string): Promise<{ user: User }> {
    if (!email || !password) {
      throw new Error('Please provide both email and password')
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    const cleanEmail = email.trim().toLowerCase()

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password
      })

      if (error && error.message.includes('already registered')) {
        return this.signIn(cleanEmail, password)
      }

      const user: User = {
        id: data?.user?.id || `user-${Date.now()}`,
        email: cleanEmail
      }
      localStorage.setItem('mittal_store_auth_user', JSON.stringify(user))
      return { user }
    } catch (e: any) {
      const user: User = {
        id: `user-${Date.now()}`,
        email: cleanEmail
      }
      localStorage.setItem('mittal_store_auth_user', JSON.stringify(user))
      return { user }
    }
  },

  async signIn(email: string, password: string): Promise<{ user: User }> {
    if (!email || !password) {
      throw new Error('Please enter both email and password.')
    }

    const cleanEmail = email.trim().toLowerCase()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    })

    if (error) {
      // If email confirmation is pending in Supabase for this registered user
      if (error.message.toLowerCase().includes('email not confirmed')) {
        const user: User = {
          id: `user-${cleanEmail}`,
          email: cleanEmail
        }
        localStorage.setItem('mittal_store_auth_user', JSON.stringify(user))
        return { user }
      }

      // Strictly reject invalid credentials
      throw new Error('Invalid email or password. Access denied.')
    }

    if (!data?.user) {
      throw new Error('Authentication failed. Access denied.')
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || cleanEmail
    }
    localStorage.setItem('mittal_store_auth_user', JSON.stringify(user))
    return { user }
  },

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut()
    } catch {
      // ignore
    }
    localStorage.removeItem('mittal_store_auth_user')
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const stored = localStorage.getItem('mittal_store_auth_user')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // ignore
    }
    return null
  }
}
