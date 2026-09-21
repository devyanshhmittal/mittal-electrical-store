-- MULTI-TENANT ISOLATION MIGRATION
-- Run this in your Supabase SQL Editor once to enable per-user isolated databases

-- 1. Add user_id column to all tables
ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id text DEFAULT 'admin@mittalelectrical.com';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS user_id text DEFAULT 'admin@mittalelectrical.com';
ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id text DEFAULT 'admin@mittalelectrical.com';
ALTER TABLE category_specifications ADD COLUMN IF NOT EXISTS user_id text DEFAULT 'admin@mittalelectrical.com';
ALTER TABLE product_specifications ADD COLUMN IF NOT EXISTS user_id text DEFAULT 'admin@mittalelectrical.com';
ALTER TABLE stock_history ADD COLUMN IF NOT EXISTS user_id text DEFAULT 'admin@mittalelectrical.com';

-- 2. Update existing data to belong to admin@mittalelectrical.com
UPDATE categories SET user_id = 'admin@mittalelectrical.com' WHERE user_id IS NULL OR user_id = 'default';
UPDATE brands SET user_id = 'admin@mittalelectrical.com' WHERE user_id IS NULL OR user_id = 'default';
UPDATE products SET user_id = 'admin@mittalelectrical.com' WHERE user_id IS NULL OR user_id = 'default';
UPDATE category_specifications SET user_id = 'admin@mittalelectrical.com' WHERE user_id IS NULL OR user_id = 'default';
UPDATE product_specifications SET user_id = 'admin@mittalelectrical.com' WHERE user_id IS NULL OR user_id = 'default';
UPDATE stock_history SET user_id = 'admin@mittalelectrical.com' WHERE user_id IS NULL OR user_id = 'default';

-- 3. Replace single unique constraints with per-user unique constraints
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_user_id_key;
ALTER TABLE categories ADD CONSTRAINT categories_name_user_id_key UNIQUE (name, user_id);

ALTER TABLE brands DROP CONSTRAINT IF EXISTS brands_name_key;
ALTER TABLE brands DROP CONSTRAINT IF EXISTS brands_name_user_id_key;
ALTER TABLE brands ADD CONSTRAINT brands_name_user_id_key UNIQUE (name, user_id);

-- 4. Create performance indexes on user_id
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_category_specs_user_id ON category_specifications(user_id);
CREATE INDEX IF NOT EXISTS idx_product_specs_user_id ON product_specifications(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_user_id ON stock_history(user_id);
