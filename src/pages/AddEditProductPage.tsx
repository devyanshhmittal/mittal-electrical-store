import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { SidebarLayout } from '../layouts/SidebarLayout'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { brandService } from '../services/brandService'
import { specificationService, productSpecificationService } from '../services/specificationService'
import { Category, Brand, CategorySpecification } from '../types'
import { ConfirmationDialog } from '../components/ConfirmationDialog'
import {
  ArrowLeft,
  Save,
  Package,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

interface AddEditProductPageProps {
  onNotify?: (msg: string, type: 'success' | 'error' | 'info') => void
}

export const AddEditProductPage: React.FC<AddEditProductPageProps> = ({ onNotify }) => {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [availableSpecs, setAvailableSpecs] = useState<CategorySpecification[]>([])

  // Basic Product Fields
  const [productName, setProductName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [modelNumber, setModelNumber] = useState('')
  const [colour, setColour] = useState('')
  const [quantity, setQuantity] = useState<number>(1)
  const [purchasePrice, setPurchasePrice] = useState<number>(0)
  const [sellingPrice, setSellingPrice] = useState<number>(0)
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5)
  const [imageUrl, setImageUrl] = useState('')

  // Specification Values (Key = specification_id, Value = user input)
  const [specValues, setSpecValues] = useState<Record<string, string>>({})

  // Duplicate Check State
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  const [duplicateProduct, setDuplicateProduct] = useState<any>(null)
  const [pendingSubmit, setPendingSubmit] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [id])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [cats, brs] = await Promise.all([
        categoryService.getAll(),
        brandService.getAll()
      ])
      setCategories(cats)
      setBrands(brs)

      if (id) {
        const prod = await productService.getById(id)
        setProductName(prod.product_name)
        setCategoryId(prod.category_id)
        setBrandId(prod.brand_id)
        setModelNumber(prod.model_number)
        setColour(prod.colour)
        setQuantity(prod.quantity)
        setPurchasePrice(prod.purchase_price)
        setSellingPrice(prod.selling_price)
        setLowStockThreshold(prod.low_stock_threshold)
        setImageUrl(prod.image_url || '')

        // Load category specifications
        const specs = await specificationService.getByCategory(prod.category_id)
        setAvailableSpecs(specs)

        // Load product specs
        const pSpecs = await productSpecificationService.getByProduct(id)
        const mappedSpecs: Record<string, string> = {}
        pSpecs.forEach(ps => {
          mappedSpecs[ps.specification_id] = ps.value
        })
        setSpecValues(mappedSpecs)
      }
    } catch (e: any) {
      onNotify?.(e.message || 'Error loading product', 'error')
    } finally {
      setLoading(false)
    }
  }

  // When category changes, load its specifications dynamically
  const handleCategoryChange = async (newCatId: string) => {
    setCategoryId(newCatId)
    if (newCatId) {
      const specs = await specificationService.getByCategory(newCatId)
      setAvailableSpecs(specs)
    } else {
      setAvailableSpecs([])
    }
    // Clear spec values that don't belong
    setSpecValues({})
  }

  const handleSpecValueChange = (specId: string, val: string) => {
    setSpecValues(prev => ({ ...prev, [specId]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!productName.trim()) {
      onNotify?.('Please enter product name', 'error')
      return
    }
    if (!categoryId) {
      onNotify?.('Please select a category', 'error')
      return
    }
    if (!brandId) {
      onNotify?.('Please select a brand', 'error')
      return
    }
    if (!modelNumber.trim()) {
      onNotify?.('Please enter model number', 'error')
      return
    }
    if (!colour.trim()) {
      onNotify?.('Please enter colour', 'error')
      return
    }

    // Check duplicate: Category + Brand + Model + Colour
    const duplicate = await productService.checkDuplicate(categoryId, brandId, modelNumber, colour, id)
    if (duplicate && !isEditMode) {
      setDuplicateProduct(duplicate)
      setDuplicateModalOpen(true)
      return
    }

    await saveProductData()
  }

  const saveProductData = async () => {
    setLoading(true)
    try {
      let savedProduct
      if (isEditMode && id) {
        savedProduct = await productService.update(id, {
          product_name: productName.trim(),
          category_id: categoryId,
          brand_id: brandId,
          model_number: modelNumber.trim(),
          colour: colour.trim(),
          quantity,
          purchase_price: purchasePrice,
          selling_price: sellingPrice,
          low_stock_threshold: lowStockThreshold,
          image_url: imageUrl
        })
        onNotify?.('Product updated successfully!', 'success')
      } else {
        savedProduct = await productService.create({
          product_name: productName.trim(),
          category_id: categoryId,
          brand_id: brandId,
          model_number: modelNumber.trim(),
          colour: colour.trim(),
          quantity,
          purchase_price: purchasePrice,
          selling_price: sellingPrice,
          low_stock_threshold: lowStockThreshold,
          image_url: imageUrl
        })
        onNotify?.('Product added to inventory!', 'success')
      }

      // Save category-specific specifications
      for (const spec of availableSpecs) {
        const val = specValues[spec.id]
        if (val !== undefined && val.trim() !== '') {
          await productSpecificationService.upsert(savedProduct.id, spec.id, val.trim())
        }
      }

      navigate('/inventory')
    } catch (e: any) {
      onNotify?.(e.message || 'Error saving product', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStockInstead = async () => {
    if (!duplicateProduct) return
    try {
      const newTotal = duplicateProduct.quantity + quantity
      await productService.updateStock(duplicateProduct.id, newTotal)
      onNotify?.(`Updated stock for ${duplicateProduct.product_name} to ${newTotal} units`, 'success')
      setDuplicateModalOpen(false)
      navigate('/inventory')
    } catch (e: any) {
      onNotify?.(e.message || 'Failed to update stock', 'error')
    }
  }

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link & Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/inventory"
              className="p-2 bg-white rounded-xl text-slate-500 hover:text-slate-900 border border-slate-200/80 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditMode ? 'Update product information and specifications' : 'Fill in basic details and optional category specifications'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Product Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Package size={16} />
              </div>
              <h2 className="text-base font-bold text-slate-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Product Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Water Heater / LED Bulb / Air Purifier"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Brand <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
                >
                  <option value="">Select Brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Model Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Model Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modelNumber}
                  onChange={(e) => setModelNumber(e.target.value)}
                  placeholder="e.g. AC1215 / Monza EC 15 / 12W-B22"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              {/* Colour */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Colour <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  placeholder="e.g. White / Black / Silver / Red"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Initial Stock Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              {/* Low Stock Threshold */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Low-Stock Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10) || 5)}
                  placeholder="Default: 5"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Purchase Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                  placeholder="₹ 0.00"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Selling Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  placeholder="₹ 0.00"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              {/* Product Image URL */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Product Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/product-image.jpg"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Optional Category-Specific Specifications */}
          {categoryId && availableSpecs.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Additional Details & Specifications
                    </h2>
                    <p className="text-xs text-slate-500">
                      Optional specifications for {categories.find(c => c.id === categoryId)?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {availableSpecs.map((spec) => {
                  const val = specValues[spec.id] || ''

                  return (
                    <div key={spec.id}>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {spec.field_name} {spec.unit ? `(${spec.unit})` : ''}
                      </label>

                      {spec.field_type === 'dropdown' ? (
                        <select
                          value={val}
                          onChange={(e) => handleSpecValueChange(spec.id, e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
                        >
                          <option value="">Select {spec.field_name}</option>
                          {spec.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : spec.field_type === 'yes_no' ? (
                        <select
                          value={val}
                          onChange={(e) => handleSpecValueChange(spec.id, e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
                        >
                          <option value="">Select Yes / No</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      ) : spec.field_type === 'number' ? (
                        <div className="relative">
                          <input
                            type="number"
                            value={val}
                            onChange={(e) => handleSpecValueChange(spec.id, e.target.value)}
                            placeholder={`e.g. 15 ${spec.unit || ''}`}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all pr-12"
                          />
                          {spec.unit && (
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                              {spec.unit}
                            </span>
                          )}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleSpecValueChange(spec.id, e.target.value)}
                          placeholder={`Enter ${spec.field_name}`}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/inventory"
              className="px-5 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-2xl border border-slate-200/80 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-7 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isEditMode ? 'Update Product' : 'Save to Inventory'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Duplicate Product Warning Modal */}
      <ConfirmationDialog
        isOpen={duplicateModalOpen}
        title="Product Already Exists"
        message={`A product with Category "${categories.find(c => c.id === categoryId)?.name}", Brand "${brands.find(b => b.id === brandId)?.name}", Model "${modelNumber}" and Colour "${colour}" already exists in inventory (Current Stock: ${duplicateProduct?.quantity} units).\n\nWould you like to increase its stock quantity by +${quantity} units instead?`}
        confirmText={`Yes, Update Stock (+${quantity})`}
        cancelText="Cancel"
        onConfirm={handleUpdateStockInstead}
        onCancel={() => setDuplicateModalOpen(false)}
      />
    </SidebarLayout>
  )
}
