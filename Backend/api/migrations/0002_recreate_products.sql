-- 0002_seed.sql

DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;

INSERT INTO products (
    id, name, sku, category, emoji, description,
    price, cost_price, original_price, discount_percent,
    unit, stock_qty, min_qty, max_daily_qty,
    supplier_name, in_stock, active
) VALUES

-- Grocery
('prod_001', 'Toor Dal (1kg)', 'GRO-TDAL-1K', 'Grocery', '🫘', 'Premium quality toor dal', 145, 120, 160, 9, 'kg', 50, 1, 10, 'Agro Traders', 1, 1),
('prod_002', 'Basmati Rice (5kg)', 'GRO-RICE-5K', 'Grocery', '🍚', 'Aromatic basmati rice', 420, 350, 480, 12, 'bag', 30, 1, 5, 'Agro Traders', 1, 1),
('prod_003', 'Aashirvaad Atta (5kg)', 'GRO-ATTA-5K', 'Grocery', '🌾', 'Whole wheat atta', 275, 240, 290, 5, 'bag', 40, 1, 8, 'ITC', 1, 1),
('prod_004', 'Mustard Oil (1L)', 'GRO-MOIL-1L', 'Grocery', '🫗', 'Cold-pressed mustard oil', 195, 160, 220, 11, 'bottle', 35, 1, 6, 'Agro Traders', 1, 1),

-- Dairy
('prod_005', 'Amul Taza Milk (1L)', 'DAI-MILK-1L', 'Dairy', '🥛', 'Fresh milk', 30, 26, NULL, 0, 'packet', 100, 1, 20, 'Amul', 1, 1),
('prod_006', 'Amul Butter (100g)', 'DAI-BUTR-100', 'Dairy', '🧈', 'Creamy butter', 58, 48, 62, 6, 'pack', 60, 1, 10, 'Amul', 1, 1),
('prod_007', 'Paneer (200g)', 'DAI-PANR-200', 'Dairy', '🧀', 'Fresh paneer', 90, 70, 100, 10, 'pack', 25, 1, 8, 'Local Dairy', 1, 1),

-- Snacks
('prod_008', 'Lays Classic Salted', 'SNK-LAYS-52', 'Snacks', '🥔', 'Potato chips', 20, 16, NULL, 0, 'pack', 80, 1, 20, 'PepsiCo', 1, 1),
('prod_009', 'Haldiram Namkeen', 'SNK-HALD-200', 'Snacks', '🍘', 'Aloo bhujia', 55, 42, 60, 8, 'pack', 45, 1, 15, 'Haldiram', 1, 1),
('prod_010', 'Parle-G Biscuit', 'SNK-PARLG-250', 'Snacks', '🍪', 'Glucose biscuit', 25, 20, 28, 10, 'pack', 100, 1, 30, 'Parle', 1, 1),
('prod_011', 'Maggi Noodles', 'SNK-MAGI-4P', 'Snacks', '🍜', 'Instant noodles', 56, 45, 60, 6, 'pack', 70, 1, 15, 'Nestle', 1, 1),

-- Beverages
('prod_012', 'Coca Cola (750ml)', 'BEV-COLA-750', 'Beverages', '🥤', 'Cola drink', 40, 32, 45, 11, 'bottle', 60, 1, 15, 'CocaCola', 1, 1),
('prod_013', 'Tata Tea Gold', 'BEV-TEA-500', 'Beverages', '🍵', 'Premium tea', 270, 230, 295, 8, 'pack', 35, 1, 8, 'Tata', 1, 1),
('prod_014', 'Nescafe Classic', 'BEV-NCAF-50', 'Beverages', '☕', 'Instant coffee', 155, 130, 170, 8, 'jar', 40, 1, 10, 'Nestle', 1, 1),

-- Household
('prod_015', 'Vim Dishwash Bar', 'HSH-VIM-300', 'Household', '🧽', 'Dishwash bar', 30, 24, 35, 14, 'bar', 55, 1, 12, 'HUL', 1, 1),
('prod_016', 'Surf Excel', 'HSH-SURF-1K', 'Household', '🧺', 'Detergent powder', 135, 110, 150, 10, 'pack', 40, 1, 8, 'HUL', 1, 1),
('prod_017', 'Harpic', 'HSH-HARP-500', 'Household', '🚽', 'Toilet cleaner', 95, 78, 110, 13, 'bottle', 30, 1, 10, 'Reckitt', 1, 1),
('prod_018', 'Agarbatti', 'HSH-AGBT-100', 'Household', '🪔', 'Incense sticks', 45, 30, 50, 10, 'box', 50, 1, 15, 'Local', 1, 1);