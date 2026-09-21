import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { ToastContainer, ToastMessage } from './components/Toast'

// Pages
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { InventoryPage } from './pages/InventoryPage'
import { AddEditProductPage } from './pages/AddEditProductPage'
import { ProductDetailsPage } from './pages/ProductDetailsPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { BrandsPage } from './pages/BrandsPage'
import { ExcelPage } from './pages/ExcelPage'
import { SettingsPage } from './pages/SettingsPage'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user)
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage onNotify={notify} />} />

        {/* Protected Dashboard & Inventory Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <InventoryPage onNotify={notify} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/add"
          element={
            <ProtectedRoute>
              <AddEditProductPage onNotify={notify} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/:id"
          element={
            <ProtectedRoute>
              <ProductDetailsPage onNotify={notify} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/:id/edit"
          element={
            <ProtectedRoute>
              <AddEditProductPage onNotify={notify} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <CategoriesPage onNotify={notify} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/brands"
          element={
            <ProtectedRoute>
              <BrandsPage onNotify={notify} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/excel"
          element={
            <ProtectedRoute>
              <ExcelPage onNotify={notify} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage onNotify={notify} />
            </ProtectedRoute>
          }
        />

        {/* Fallback to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}

export default App
