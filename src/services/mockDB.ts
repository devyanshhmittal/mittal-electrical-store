import { Category, Brand, Product, CategorySpecification, ProductSpecification, StockHistory } from '../types'

export const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

const now = new Date().toISOString()

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Personal Care', created_at: now, updated_at: now },
  { id: 'cat-2', name: 'Kitchen Appliances', created_at: now, updated_at: now },
  { id: 'cat-3', name: 'Lights', created_at: now, updated_at: now },
  { id: 'cat-4', name: 'Switches', created_at: now, updated_at: now },
  { id: 'cat-5', name: 'Geysers', created_at: now, updated_at: now },
  { id: 'cat-6', name: 'Air Purifiers', created_at: now, updated_at: now },
]

export const initialBrands: Brand[] = [
  { id: 'br-1', name: 'Philips', created_at: now, updated_at: now },
  { id: 'br-2', name: 'Havells', created_at: now, updated_at: now },
  { id: 'br-3', name: 'Bajaj', created_at: now, updated_at: now },
  { id: 'br-4', name: 'Crompton', created_at: now, updated_at: now },
  { id: 'br-5', name: 'Orient', created_at: now, updated_at: now },
  { id: 'br-6', name: 'Syska', created_at: now, updated_at: now },
  { id: 'br-7', name: 'Wipro', created_at: now, updated_at: now },
  { id: 'br-8', name: 'Anchor', created_at: now, updated_at: now },
  { id: 'br-9', name: 'Legrand', created_at: now, updated_at: now },
]

export const initialCategorySpecs: CategorySpecification[] = [
  // Geysers specs
  { id: 'spec-1', category_id: 'cat-5', field_name: 'Capacity', field_type: 'number', unit: 'L', created_at: now },
  { id: 'spec-2', category_id: 'cat-5', field_name: 'Wattage', field_type: 'number', unit: 'W', created_at: now },
  { id: 'spec-3', category_id: 'cat-5', field_name: 'Type', field_type: 'dropdown', options: ['Storage', 'Instant', 'Gas', 'Solar'], created_at: now },
  { id: 'spec-4', category_id: 'cat-5', field_name: 'Energy Rating', field_type: 'dropdown', options: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'], created_at: now },
  { id: 'spec-5', category_id: 'cat-5', field_name: 'Installation Type', field_type: 'dropdown', options: ['Wall Mounted', 'Floor Standing'], created_at: now },

  // Lights specs
  { id: 'spec-6', category_id: 'cat-3', field_name: 'Wattage', field_type: 'number', unit: 'W', created_at: now },
  { id: 'spec-7', category_id: 'cat-3', field_name: 'Lumens', field_type: 'number', unit: 'lm', created_at: now },
  { id: 'spec-8', category_id: 'cat-3', field_name: 'Light Type', field_type: 'dropdown', options: ['LED Bulb', 'Tube Light', 'Panel Light', 'Spot Light', 'Strip Light'], created_at: now },
  { id: 'spec-9', category_id: 'cat-3', field_name: 'Colour Temperature', field_type: 'dropdown', options: ['Warm White (3000K)', 'Neutral White (4000K)', 'Cool White (6500K)'], created_at: now },

  // Air Purifier specs
  { id: 'spec-10', category_id: 'cat-6', field_name: 'Coverage Area', field_type: 'text', unit: 'sq.ft', created_at: now },
  { id: 'spec-11', category_id: 'cat-6', field_name: 'CADR', field_type: 'text', unit: 'm³/h', created_at: now },
  { id: 'spec-12', category_id: 'cat-6', field_name: 'Filter Type', field_type: 'dropdown', options: ['HEPA', 'Carbon Filter', 'True HEPA + Carbon'], created_at: now },
  { id: 'spec-13', category_id: 'cat-6', field_name: 'Smart WiFi', field_type: 'yes_no', created_at: now },

  // Kitchen Appliances specs
  { id: 'spec-14', category_id: 'cat-2', field_name: 'Appliance Type', field_type: 'dropdown', options: ['Mixer Grinder', 'Induction Cooktop', 'Electric Kettle', 'Toaster', 'Hand Blender'], created_at: now },
  { id: 'spec-15', category_id: 'cat-2', field_name: 'Wattage', field_type: 'number', unit: 'W', created_at: now },
  { id: 'spec-16', category_id: 'cat-2', field_name: 'Capacity', field_type: 'text', created_at: now },

  // Switches specs
  { id: 'spec-17', category_id: 'cat-4', field_name: 'Modules', field_type: 'number', created_at: now },
  { id: 'spec-18', category_id: 'cat-4', field_name: 'Switch Type', field_type: 'dropdown', options: ['1-Way', '2-Way', 'Bell Push', 'Dimmer', 'Socket'], created_at: now },
  { id: 'spec-19', category_id: 'cat-4', field_name: 'Series', field_type: 'text', created_at: now },

  // Personal Care specs
  { id: 'spec-20', category_id: 'cat-1', field_name: 'Product Type', field_type: 'dropdown', options: ['Hair Dryer', 'Trimmer', 'Straightener', 'Shaver'], created_at: now },
  { id: 'spec-21', category_id: 'cat-1', field_name: 'Wattage', field_type: 'number', unit: 'W', created_at: now },
  { id: 'spec-22', category_id: 'cat-1', field_name: 'Power Type', field_type: 'dropdown', options: ['Corded', 'Cordless / Rechargeable', 'Battery Operated'], created_at: now },
]

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    product_name: 'Monza Water Heater',
    category_id: 'cat-5',
    brand_id: 'br-2',
    model_number: 'Monza EC 15',
    colour: 'White',
    quantity: 5,
    purchase_price: 8000,
    selling_price: 10000,
    low_stock_threshold: 5,
    image_url: '',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'prod-2',
    product_name: 'LED Bulb 12W',
    category_id: 'cat-3',
    brand_id: 'br-1',
    model_number: '12W-B22-CW',
    colour: 'White',
    quantity: 50,
    purchase_price: 100,
    selling_price: 150,
    low_stock_threshold: 15,
    image_url: '',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'prod-3',
    product_name: 'Series 1000 Air Purifier',
    category_id: 'cat-6',
    brand_id: 'br-1',
    model_number: 'AC1215',
    colour: 'White',
    quantity: 8,
    purchase_price: 8000,
    selling_price: 10000,
    low_stock_threshold: 5,
    image_url: '',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'prod-4',
    product_name: 'Series 1000 Air Purifier (Black)',
    category_id: 'cat-6',
    brand_id: 'br-1',
    model_number: 'AC1215',
    colour: 'Black',
    quantity: 3,
    purchase_price: 8200,
    selling_price: 10500,
    low_stock_threshold: 5,
    image_url: '',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'prod-5',
    product_name: 'GX1 Mixer Grinder',
    category_id: 'cat-2',
    brand_id: 'br-3',
    model_number: 'GX1',
    colour: 'Black',
    quantity: 12,
    purchase_price: 1500,
    selling_price: 2000,
    low_stock_threshold: 5,
    image_url: '',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'prod-6',
    product_name: 'Roma Modular Switch 1-Way',
    category_id: 'cat-4',
    brand_id: 'br-9',
    model_number: 'Roma 10AX',
    colour: 'White',
    quantity: 100,
    purchase_price: 150,
    selling_price: 250,
    low_stock_threshold: 20,
    image_url: '',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'prod-7',
    product_name: 'Syska Hair Dryer',
    category_id: 'cat-1',
    brand_id: 'br-6',
    model_number: 'HD1000',
    colour: 'Black',
    quantity: 2,
    purchase_price: 800,
    selling_price: 1200,
    low_stock_threshold: 5,
    image_url: '',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'prod-8',
    product_name: 'Orient Electric Desk Lamp',
    category_id: 'cat-3',
    brand_id: 'br-5',
    model_number: 'DL-09',
    colour: 'Silver',
    quantity: 0,
    purchase_price: 600,
    selling_price: 950,
    low_stock_threshold: 5,
    image_url: '',
    created_at: now,
    updated_at: now,
  }
]

export const initialProductSpecs: ProductSpecification[] = [
  // Monza Geyser specs
  { id: 'ps-1', product_id: 'prod-1', specification_id: 'spec-1', value: '15', created_at: now, updated_at: now },
  { id: 'ps-2', product_id: 'prod-1', specification_id: 'spec-2', value: '2000', created_at: now, updated_at: now },
  { id: 'ps-3', product_id: 'prod-1', specification_id: 'spec-3', value: 'Storage', created_at: now, updated_at: now },
  { id: 'ps-4', product_id: 'prod-1', specification_id: 'spec-4', value: '5 Star', created_at: now, updated_at: now },
  { id: 'ps-5', product_id: 'prod-1', specification_id: 'spec-5', value: 'Wall Mounted', created_at: now, updated_at: now },

  // Philips 12W LED specs
  { id: 'ps-6', product_id: 'prod-2', specification_id: 'spec-6', value: '12', created_at: now, updated_at: now },
  { id: 'ps-7', product_id: 'prod-2', specification_id: 'spec-7', value: '1100', created_at: now, updated_at: now },
  { id: 'ps-8', product_id: 'prod-2', specification_id: 'spec-8', value: 'LED Bulb', created_at: now, updated_at: now },
  { id: 'ps-9', product_id: 'prod-2', specification_id: 'spec-9', value: 'Cool White (6500K)', created_at: now, updated_at: now },

  // AC1215 Air Purifier specs
  { id: 'ps-10', product_id: 'prod-3', specification_id: 'spec-10', value: '400', created_at: now, updated_at: now },
  { id: 'ps-11', product_id: 'prod-3', specification_id: 'spec-11', value: '300', created_at: now, updated_at: now },
  { id: 'ps-12', product_id: 'prod-3', specification_id: 'spec-12', value: 'HEPA', created_at: now, updated_at: now },
  { id: 'ps-13', product_id: 'prod-3', specification_id: 'spec-13', value: 'Yes', created_at: now, updated_at: now },
]

export const initialStockHistory: StockHistory[] = [
  { id: 'hist-1', product_id: 'prod-1', product_name: 'Monza Water Heater', previous_quantity: 0, change_quantity: 5, new_quantity: 5, created_at: now },
  { id: 'hist-2', product_id: 'prod-2', product_name: 'LED Bulb 12W', previous_quantity: 30, change_quantity: 20, new_quantity: 50, created_at: now },
  { id: 'hist-3', product_id: 'prod-3', product_name: 'Series 1000 Air Purifier', previous_quantity: 10, change_quantity: -2, new_quantity: 8, created_at: now },
]

export const getStoredData = <T>(key: string, defaultFallback: T): T => {
  try {
    const item = localStorage.getItem(`mittal_store_${key}`)
    if (item) {
      return JSON.parse(item) as T
    }
    localStorage.setItem(`mittal_store_${key}`, JSON.stringify(defaultFallback))
    return defaultFallback
  } catch (e) {
    return defaultFallback
  }
}

export const saveStoredData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`mittal_store_${key}`, JSON.stringify(data))
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e)
  }
}
