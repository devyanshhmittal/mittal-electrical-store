import * as XLSX from 'xlsx'
import { Product, Category, Brand } from '../types'
import { categoryService } from './categoryService'
import { brandService } from './brandService'
import { productService } from './productService'

export interface ImportPreviewRow {
  rowNumber: number
  productName: string
  categoryName: string
  brandName: string
  modelNumber: string
  colour: string
  quantity: number
  purchasePrice: number
  sellingPrice: number
  lowStockThreshold?: number
  categoryId?: string
  brandId?: string
  isValid: boolean
  errors: string[]
  isUpdate?: boolean
  existingProductId?: string
  specifications?: Record<string, string>
}

export const excelService = {
  async parseExcelFile(file: File): Promise<ImportPreviewRow[]> {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' })

    const categories = await categoryService.getAll()
    const brands = await brandService.getAll()
    const existingProducts = await productService.getAll()

    const previewRows: ImportPreviewRow[] = []

    for (let i = 0; i < jsonRows.length; i++) {
      const row = jsonRows[i]
      const rowNumber = i + 2 // 1-based index including header

      const productName = String(row['Product Name'] || row['Product'] || row['product_name'] || '').trim()
      const categoryName = String(row['Category'] || row['category'] || '').trim()
      const brandName = String(row['Brand'] || row['brand'] || '').trim()
      const modelNumber = String(row['Model Number'] || row['Model'] || row['model_number'] || '').trim()
      const colour = String(row['Colour'] || row['Color'] || row['colour'] || '').trim()
      const quantity = parseInt(String(row['Quantity'] || row['Qty'] || row['quantity'] || '0'), 10)
      const purchasePrice = parseFloat(String(row['Purchase Price'] || row['Purchase'] || row['purchase_price'] || '0'))
      const sellingPrice = parseFloat(String(row['Selling Price'] || row['Selling'] || row['selling_price'] || '0'))
      const lowStockThreshold = parseInt(String(row['Low Stock Threshold'] || row['Threshold'] || '5'), 10) || 5

      const errors: string[] = []
      if (!productName) errors.push('Product Name is required')
      if (!categoryName) errors.push('Category is required')
      if (!brandName) errors.push('Brand is required')
      if (isNaN(quantity) || quantity < 0) errors.push('Quantity must be >= 0')
      if (isNaN(purchasePrice) || purchasePrice < 0) errors.push('Purchase price must be >= 0')
      if (isNaN(sellingPrice) || sellingPrice < 0) errors.push('Selling price must be >= 0')

      const matchedCategory = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())
      const matchedBrand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase())

      if (categoryName && !matchedCategory) {
        errors.push(`Category "${categoryName}" does not exist`)
      }
      if (brandName && !matchedBrand) {
        errors.push(`Brand "${brandName}" does not exist`)
      }

      // Check for duplicate / existing product
      let isUpdate = false
      let existingProductId: string | undefined
      if (matchedCategory && matchedBrand) {
        const existing = existingProducts.find(p =>
          p.category_id === matchedCategory.id &&
          p.brand_id === matchedBrand.id &&
          p.model_number.toLowerCase().trim() === modelNumber.toLowerCase().trim() &&
          p.colour.toLowerCase().trim() === colour.toLowerCase().trim()
        )
        if (existing) {
          isUpdate = true
          existingProductId = existing.id
        }
      }

      // Collect any extra columns as specifications
      const knownKeys = [
        'product name', 'product', 'product_name',
        'category',
        'brand',
        'model number', 'model', 'model_number',
        'colour', 'color',
        'quantity', 'qty',
        'purchase price', 'purchase', 'purchase_price',
        'selling price', 'selling', 'selling_price',
        'low stock threshold', 'threshold'
      ]
      const specifications: Record<string, string> = {}
      Object.keys(row).forEach(k => {
        if (!knownKeys.includes(k.toLowerCase().trim()) && row[k] !== '') {
          specifications[k.trim()] = String(row[k]).trim()
        }
      })

      previewRows.push({
        rowNumber,
        productName,
        categoryName,
        brandName,
        modelNumber,
        colour,
        quantity: isNaN(quantity) ? 0 : quantity,
        purchasePrice: isNaN(purchasePrice) ? 0 : purchasePrice,
        sellingPrice: isNaN(sellingPrice) ? 0 : sellingPrice,
        lowStockThreshold,
        categoryId: matchedCategory?.id,
        brandId: matchedBrand?.id,
        isValid: errors.length === 0,
        errors,
        isUpdate,
        existingProductId,
        specifications
      })
    }

    return previewRows
  },

  async executeImport(rows: ImportPreviewRow[]): Promise<{ imported: number; updated: number; errors: number }> {
    let imported = 0
    let updated = 0
    let errors = 0

    for (const row of rows) {
      if (!row.isValid || !row.categoryId || !row.brandId) {
        errors++
        continue
      }

      try {
        if (row.isUpdate && row.existingProductId) {
          await productService.updateStock(row.existingProductId, row.quantity)
          updated++
        } else {
          await productService.create({
            product_name: row.productName,
            category_id: row.categoryId,
            brand_id: row.brandId,
            model_number: row.modelNumber,
            colour: row.colour,
            quantity: row.quantity,
            purchase_price: row.purchasePrice,
            selling_price: row.sellingPrice,
            low_stock_threshold: row.lowStockThreshold || 5,
            image_url: ''
          })
          imported++
        }
      } catch (e) {
        errors++
      }
    }

    return { imported, updated, errors }
  },

  exportProductsToExcel(products: Product[], filename = 'Mittal_Electrical_Inventory.xlsx') {
    const data = products.map(p => {
      const stockStatus = p.quantity === 0 ? 'Out of Stock' : (p.quantity <= p.low_stock_threshold ? 'Low Stock' : 'In Stock')
      const row: Record<string, any> = {
        'Product Name': p.product_name,
        'Category': p.category?.name || '',
        'Brand': p.brand?.name || '',
        'Model Number': p.model_number,
        'Colour': p.colour,
        'Quantity': p.quantity,
        'Purchase Price (₹)': p.purchase_price,
        'Selling Price (₹)': p.selling_price,
        'Stock Status': stockStatus,
        'Low Stock Threshold': p.low_stock_threshold,
      }

      // Add category specifications as columns
      if (p.specifications && p.specifications.length > 0) {
        p.specifications.forEach(spec => {
          if (spec.specification?.field_name) {
            const unitLabel = spec.specification.unit ? ` (${spec.specification.unit})` : ''
            row[`Spec: ${spec.specification.field_name}${unitLabel}`] = spec.value
          }
        })
      }

      return row
    })

    const worksheet = XLSX.utils.json_to_sheet(data)

    // Set column widths
    worksheet['!cols'] = [
      { wch: 28 }, // Product Name
      { wch: 18 }, // Category
      { wch: 16 }, // Brand
      { wch: 16 }, // Model Number
      { wch: 12 }, // Colour
      { wch: 10 }, // Quantity
      { wch: 18 }, // Purchase Price
      { wch: 18 }, // Selling Price
      { wch: 14 }, // Stock Status
      { wch: 18 }, // Low Stock Threshold
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory')
    XLSX.writeFile(workbook, filename)
  },

  downloadTemplate() {
    const templateData = [
      {
        'Product Name': 'Monza Water Heater',
        'Category': 'Geysers',
        'Brand': 'Havells',
        'Model Number': 'Monza EC 15',
        'Colour': 'White',
        'Quantity': 5,
        'Purchase Price': 8000,
        'Selling Price': 10000,
        'Low Stock Threshold': 5,
        'Capacity': '15',
        'Wattage': '2000',
        'Energy Rating': '5 Star'
      },
      {
        'Product Name': 'LED Bulb 12W',
        'Category': 'Lights',
        'Brand': 'Philips',
        'Model Number': '12W-B22-CW',
        'Colour': 'White',
        'Quantity': 50,
        'Purchase Price': 100,
        'Selling Price': 150,
        'Low Stock Threshold': 15,
        'Wattage': '12',
        'Lumens': '1100',
        'Colour Temperature': 'Cool White (6500K)'
      },
      {
        'Product Name': 'Series 1000 Air Purifier',
        'Category': 'Air Purifiers',
        'Brand': 'Philips',
        'Model Number': 'AC1215',
        'Colour': 'White',
        'Quantity': 8,
        'Purchase Price': 8000,
        'Selling Price': 10000,
        'Low Stock Threshold': 5,
        'Coverage Area': '400',
        'CADR': '300',
        'Filter Type': 'HEPA'
      }
    ]

    const worksheet = XLSX.utils.json_to_sheet(templateData)
    worksheet['!cols'] = [
      { wch: 28 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 12 },
      { wch: 10 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 20 },
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
    XLSX.writeFile(workbook, 'Mittal_Inventory_Template.xlsx')
  }
}
