-- ╔═══════════════════════════════════════════╗
-- ║  MyStore — D1 Database Schema             ║
-- ╚═══════════════════════════════════════════╝

-- Drop existing tables for clean migration
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS daily_summaries;

-- ─── Products ───
CREATE TABLE products (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    name            TEXT NOT NULL,
    sku             TEXT NOT NULL UNIQUE,
    category        TEXT NOT NULL,
    emoji           TEXT NOT NULL DEFAULT '📦',
    description     TEXT NOT NULL DEFAULT '',
    price           REAL NOT NULL,
    cost_price      REAL NOT NULL DEFAULT 0,
    original_price  REAL,
    discount_percent INTEGER DEFAULT 0,
    unit            TEXT DEFAULT 'piece',
    stock_qty       INTEGER NOT NULL DEFAULT 0,
    min_qty         INTEGER NOT NULL DEFAULT 1,
    max_daily_qty   INTEGER NOT NULL DEFAULT 50,
    supplier_name   TEXT DEFAULT '',
    supplier_phone  TEXT DEFAULT '',
    supplier_email  TEXT DEFAULT '',
    in_stock        INTEGER NOT NULL DEFAULT 1,
    active          INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Orders ───
CREATE TABLE orders (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    order_ref         TEXT NOT NULL UNIQUE,
    -- Customer
    customer_name     TEXT NOT NULL,
    customer_email    TEXT NOT NULL,
    customer_phone    TEXT NOT NULL,
    customer_address  TEXT DEFAULT '',
    customer_notes    TEXT DEFAULT '',
    -- Status: pending → verified → accepted → rejected → paid → shipped → delivered → cancelled
    status            TEXT NOT NULL DEFAULT 'pending',
    -- Delivery
    delivery_type     TEXT NOT NULL DEFAULT 'delivery' CHECK(delivery_type IN ('delivery', 'pickup')),
    delivery_charge   REAL NOT NULL DEFAULT 0,
    -- Pricing
    subtotal          REAL NOT NULL DEFAULT 0,
    total             REAL NOT NULL DEFAULT 0,
    -- Payment
    payment_link_id   TEXT,
    payment_link_url  TEXT,
    payment_id        TEXT,
    payment_status    TEXT DEFAULT 'unpaid',
    paid_at           TEXT,
    -- AI Decision (for future use)
    ai_decision       TEXT,
    ai_reasoning      TEXT,
    ai_decided_at     TEXT,
    -- Shipping
    shipping_carrier  TEXT,
    shipping_tracking TEXT,
    shipping_estimated_delivery TEXT,
    shipped_at        TEXT,
    delivered_at      TEXT,
    -- Admin
    admin_notes       TEXT DEFAULT '',
    rejection_reason  TEXT DEFAULT '',
    -- Timestamps
    created_at        TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Order Items ───
CREATE TABLE order_items (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  TEXT NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    product_emoji TEXT NOT NULL DEFAULT '📦',
    quantity    INTEGER NOT NULL,
    unit_price  REAL NOT NULL,
    total_price REAL NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Purchase Orders ───
CREATE TABLE purchase_orders (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    po_ref          TEXT NOT NULL UNIQUE,
    supplier_name   TEXT NOT NULL,
    supplier_phone  TEXT DEFAULT '',
    supplier_email  TEXT DEFAULT '',
    status          TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'sent', 'received', 'cancelled')),
    items           TEXT NOT NULL DEFAULT '[]', -- JSON array
    total_cost      REAL NOT NULL DEFAULT 0,
    notes           TEXT DEFAULT '',
    sent_at         TEXT,
    received_at     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Daily Summaries ───
CREATE TABLE daily_summaries (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    summary_date    TEXT NOT NULL UNIQUE,
    total_orders    INTEGER NOT NULL DEFAULT 0,
    total_revenue   REAL NOT NULL DEFAULT 0,
    total_items     INTEGER NOT NULL DEFAULT 0,
    orders_pending  INTEGER NOT NULL DEFAULT 0,
    orders_paid     INTEGER NOT NULL DEFAULT 0,
    orders_delivered INTEGER NOT NULL DEFAULT 0,
    orders_cancelled INTEGER NOT NULL DEFAULT 0,
    low_stock_items TEXT NOT NULL DEFAULT '[]', -- JSON
    ai_insights     TEXT DEFAULT '',
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Indexes ───
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_ref ON orders(order_ref);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_daily_date ON daily_summaries(summary_date);