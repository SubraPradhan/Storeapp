import type { Env, Product } from '../types';

interface OrderItemInput {
  product_id: string;
  quantity: number;
}

interface StockValidation {
  valid: boolean;
  errors: string[];
  products: Product[];
  subtotal: number;
}

export async function validateStock(
  env: Env,
  items: OrderItemInput[]
): Promise<StockValidation> {
  const errors: string[] = [];
  const products: Product[] = [];
  let subtotal = 0;

  if (!items || items.length === 0) {
    return { valid: false, errors: ['Order must contain at least one item.'], products, subtotal };
  }

  for (const item of items) {
    if (!item.product_id || !item.quantity || item.quantity < 1) {
      errors.push(`Invalid item: quantity must be at least 1.`);
      continue;
    }

    const product = await env.DB.prepare(
      'SELECT * FROM products WHERE id = ? AND active = 1'
    )
      .bind(item.product_id)
      .first<Product>();

    if (!product) {
      errors.push(`Product ${item.product_id} not found or inactive.`);
      continue;
    }

    if (!product.in_stock || product.stock_qty < item.quantity) {
      errors.push(
        `${product.name}: Only ${product.stock_qty} in stock, you requested ${item.quantity}.`
      );
      continue;
    }

    if (item.quantity < product.min_qty) {
      errors.push(
        `${product.name}: Minimum order quantity is ${product.min_qty}.`
      );
      continue;
    }

    if (item.quantity > product.max_daily_qty) {
      errors.push(
        `${product.name}: Maximum daily limit is ${product.max_daily_qty}.`
      );
      continue;
    }

    products.push(product);
    subtotal += product.price * item.quantity;
  }

  return { valid: errors.length === 0, errors, products, subtotal };
}

export async function decrementStock(
  env: Env,
  items: { product_id: string; quantity: number }[]
): Promise<void> {
  for (const item of items) {
    await env.DB.prepare(
      `UPDATE products
       SET stock_qty = stock_qty - ?,
           in_stock = CASE WHEN stock_qty - ? <= 0 THEN 0 ELSE 1 END,
           updated_at = datetime('now')
       WHERE id = ? AND stock_qty >= ?`
    )
      .bind(item.quantity, item.quantity, item.product_id, item.quantity)
      .run();
  }
}

export async function restoreStock(
  env: Env,
  items: { product_id: string; quantity: number }[]
): Promise<void> {
  for (const item of items) {
    await env.DB.prepare(
      `UPDATE products
       SET stock_qty = stock_qty + ?,
           in_stock = 1,
           updated_at = datetime('now')
       WHERE id = ?`
    )
      .bind(item.quantity, item.product_id)
      .run();
  }
}