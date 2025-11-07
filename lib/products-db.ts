import type { Product } from "./types"
import { seedProducts } from "./seed-data"

const products: Product[] = [...seedProducts]

export function getAllProducts(): Product[] {
  return [...products]
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getRelatedProducts(slug: string, limit = 4): Product[] {
  const product = getProductBySlug(slug)
  if (!product) return []

  return products.filter((p) => p.slug !== slug && p.brand === product.brand).slice(0, limit)
}

export function updateProduct(id: string, updates: Partial<Product>): Product | undefined {
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) return undefined
  products[index] = { ...products[index], ...updates }
  return products[index]
}

export function createProduct(product: Product): Product {
  products.push(product)
  return product
}
