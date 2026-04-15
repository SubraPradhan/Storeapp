import type { Env, Product } from '../types';
import { jsonResponse, errorResponse } from '../utils/response';

export async function getCatalog(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    `SELECT id, name, sku, category, emoji, description, price, original_price,
            discount_percent, unit, stock_qty, in_stock
     FROM products WHERE active = 1 ORDER BY category, name`
  ).all<Product>();

  const products = results || [];

  const categorySet = new Set<string>();
  for (const p of products) {
    categorySet.add(p.category);
  }
  const categories = Array.from(categorySet).sort();

  return jsonResponse({ products, categories });
}

export async function getProduct(env: Env, id: string): Promise<Response> {
  const product = await env.DB.prepare(
    `SELECT id, name, sku, category, emoji, description, price, original_price,
            discount_percent, unit, stock_qty, in_stock
     FROM products WHERE id = ? AND active = 1`
  )
    .bind(id)
    .first<Product>();

  if (!product) {
    return errorResponse('Product not found', 404);
  }

  const { results: related } = await env.DB.prepare(
    `SELECT id, name, sku, category, emoji, description, price, original_price,
            discount_percent, unit, stock_qty, in_stock
     FROM products
     WHERE category = ? AND id != ? AND active = 1
     ORDER BY RANDOM() LIMIT 4`
  )
    .bind(product.category, id)
    .all<Product>();

  return jsonResponse({ product, related: related || [] });
}