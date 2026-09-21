import React, { useState, useEffect } from 'react'
import { SidebarLayout } from '../layouts/SidebarLayout'
import { excelService, ImportPreviewRow } from '../services/excelService'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { brandService } from '../services/brandService'
import { Product, Category, Brand } from '../types'
import {
  FileSpreadsheet,
  Upload,
  Download,
  FileDown,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight
} from 'lucide-react'

interface ExcelPageProps {
  onNotify?: (msg: string, type: 'success' | 'error' | 'info') => void
}

export const ExcelPage: React.FC<ExcelPageProps> = ({ onNotify }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  // Import State
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([])
  const [fileName, setFileName] = useState<string>('')
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importSummary, setImportSummary] = useState<{ imported: number; updated: number; errors: number } | null>(null)

  // Export Filter State
  const [exportFilterCategory, setExportFilterCategory] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [prods, cats, brs] = await Promise.all([
      productService.getAll(),
      categoryService.getAll(),
      brandService.getAll()
    ])
    setProducts(prods)
    setCategories(cats)
    setBrands(brs)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setParsing(true)
    setImportSummary(null)
    try {
      const rows = await excelService.parseExcelFile(file)
      setPreviewRows(rows)
      onNotify?.(`Loaded ${rows.length} rows from "${file.name}"`, 'info')
    } catch (e: any) {
      onNotify?.(e.message || 'Failed to read Excel file', 'error')
      setPreviewRows([])
    } finally {
      setParsing(false)
      // reset input value so same file can be chosen again if needed
      e.target.value = ''
    }
  }

  const handleConfirmImport = async () => {
    if (previewRows.length === 0) return

    setImporting(true)
    try {
      const summary = await excelService.executeImport(previewRows)
      setImportSummary(summary)
      onNotify?.(`Import complete: ${summary.imported} created, ${summary.updated} updated, ${summary.errors} errors`, 'success')
      await loadData()
      setPreviewRows([])
    } catch (e: any) {
      onNotify?.(e.message || 'Import execution failed', 'error')
    } finally {
      setImporting(false)
    }
  }

  const handleExportAll = () => {
    excelService.exportProductsToExcel(products, 'Mittal_Electrical_Full_Inventory.xlsx')
    onNotify?.('Exported complete inventory to Excel', 'success')
  }

  const handleExportFiltered = () => {
    const filtered = exportFilterCategory
      ? products.filter(p => p.category_id === exportFilterCategory)
      : products
    const catName = categories.find(c => c.id === exportFilterCategory)?.name || 'Filtered'
    excelService.exportProductsToExcel(filtered, `Mittal_Electrical_${catName}_Inventory.xlsx`)
    onNotify?.(`Exported ${filtered.length} products to Excel`, 'success')
  }

  const handleDownloadTemplate = () => {
    excelService.downloadTemplate()
    onNotify?.('Downloaded Excel template with sample rows', 'success')
  }

  const validRowsCount = previewRows.filter(r => r.isValid).length
  const invalidRowsCount = previewRows.filter(r => !r.isValid).length

  return (
    <SidebarLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Excel Import & Export</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Bulk upload products from spreadsheets, export store data, and download starter templates
          </p>
        </div>

        {/* 3 Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Import Excel */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Upload size={20} />
              </div>
              <h2 className="text-base font-bold text-slate-900">Import Excel (.xlsx / .csv)</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload your existing Excel spreadsheet. We'll preview, validate, and match categories/brands before saving.
              </p>
            </div>

            <div>
              <label className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-2xl text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer">
                <Upload size={14} />
                <span>{parsing ? 'Reading File...' : 'Upload Excel File'}</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  disabled={parsing}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Card 2: Export Excel */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Download size={20} />
              </div>
              <h2 className="text-base font-bold text-slate-900">Export Store Inventory</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Download your complete inventory as a clean Excel spreadsheet including prices, quantities, and specifications.
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleExportAll}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Export All Products ({products.length})</span>
              </button>

              {categories.length > 0 && (
                <div className="flex gap-2">
                  <select
                    value={exportFilterCategory}
                    onChange={(e) => setExportFilterCategory(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleExportFiltered}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] transition-colors"
                  >
                    Export Filtered
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Download Template */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileDown size={20} />
              </div>
              <h2 className="text-base font-bold text-slate-900">Download Excel Template</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Download a pre-formatted Excel template with sample rows and column headers ready to fill with your stock.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs transition-colors border border-slate-200/80"
              >
                <FileDown size={14} />
                <span>Download Sample Template</span>
              </button>
            </div>
          </div>
        </div>

        {/* Import Summary Result Banner */}
        {importSummary && (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl animate-in zoom-in-95 duration-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
              <CheckCircle2 size={18} />
              <span>Import Execution Completed</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-emerald-900 pt-1">
              <span className="px-3 py-1 bg-white rounded-lg border border-emerald-200">
                ✅ Newly Imported: {importSummary.imported}
              </span>
              <span className="px-3 py-1 bg-white rounded-lg border border-emerald-200">
                🔄 Updated Stock: {importSummary.updated}
              </span>
              {importSummary.errors > 0 && (
                <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-lg border border-rose-200">
                  ⚠️ Errors / Skipped: {importSummary.errors}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Import Preview Section */}
        {previewRows.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in-50 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Import Preview: <span className="font-mono text-indigo-600">{fileName}</span>
                </h2>
                <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-1">
                  <span>Total rows: {previewRows.length}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-bold">Valid: {validRowsCount}</span>
                  {invalidRowsCount > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-rose-600 font-bold">Invalid: {invalidRowsCount}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewRows([])}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={importing || validRowsCount === 0}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Confirm & Import ({validRowsCount} Valid)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Preview Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Brand</th>
                    <th className="py-2.5 px-3">Model</th>
                    <th className="py-2.5 px-3">Colour</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3">Purchase</th>
                    <th className="py-2.5 px-3">Selling</th>
                    <th className="py-2.5 px-3">Validation Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewRows.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !row.isValid ? 'bg-rose-50/50' : (row.isUpdate ? 'bg-amber-50/30' : '')
                      }`}
                    >
                      <td className="py-3 px-3 font-mono text-slate-400">{row.rowNumber}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {row.isValid ? (
                          row.isUpdate ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                              Update Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              New Product
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                            Invalid
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">{row.productName || '—'}</td>
                      <td className="py-3 px-3 text-slate-700">{row.categoryName || '—'}</td>
                      <td className="py-3 px-3 text-slate-700">{row.brandName || '—'}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{row.modelNumber || '—'}</td>
                      <td className="py-3 px-3 text-slate-600">{row.colour || '—'}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900">{row.quantity}</td>
                      <td className="py-3 px-3 text-slate-600">₹{row.purchasePrice}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">₹{row.sellingPrice}</td>
                      <td className="py-3 px-3">
                        {row.errors.length > 0 ? (
                          <span className="text-rose-600 font-semibold text-[11px] block">
                            {row.errors.join(', ')}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold text-[11px]">Ready</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}
