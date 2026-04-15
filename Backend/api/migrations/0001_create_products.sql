-- 0001_init.sql

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS daily_summaries;

-- PRODUCTS
CREATE TABLE products (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    emoji TEXT DEFAULT '📦',
    description TEXT DEFAULT '',
    price REAL NOT NULL,
    cost_price REAL DEFAULT 0,
    original_price REAL,
    discount_percent INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'piece',
    stock_qty INTEGER DEFAULT 0,
    min_qty INTEGER DEFAULT 1,
    max_daily_qty INTEGER DEFAULT 50,
    supplier_name TEXT DEFAULT '',
    supplier_phone TEXT DEFAULT '',
    supplier_email TEXT DEFAULT '',
    in_stock INTEGER DEFAULT 1,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ORDERS
CREATE TABLE orders (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    order_ref TEXT UNIQUE,

    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    customer_notes TEXT,

    status TEXT DEFAULT 'pending',
    delivery_type TEXT DEFAULT 'delivery',
    delivery_charge REAL DEFAULT 0,

    subtotal REAL DEFAULT 0,
    total REAL DEFAULT 0,

    payment_status TEXT DEFAULT 'unpaid',

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ORDER ITEMS
CREATE TABLE order_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id),
    product_name TEXT,
    product_emoji TEXT,
    quantity INTEGER,
    unit_price REAL,
    total_price REAL,
    created_at TEXT DEFAULT (datetime('now'))
);