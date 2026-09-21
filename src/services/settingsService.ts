import { ShopSettings } from '../types'

const defaultSettings: ShopSettings = {
  shopName: 'Mittal Electrical Store',
  shopAddress: 'Shop No. 4, Main Market, Electrical Hub, India',
  phoneNumber: '+91 98765 43210',
  currency: '₹'
}

export const settingsService = {
  getSettings(): ShopSettings {
    try {
      const stored = localStorage.getItem('mittal_store_settings')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      // fallback
    }
    return defaultSettings
  },

  saveSettings(settings: ShopSettings): void {
    localStorage.setItem('mittal_store_settings', JSON.stringify(settings))
  }
}
