import type { Product } from "./types"
import { seedProducts } from "./seed-data"

const products: Product[] = [...seedProducts]

export function getAllProducts(): Product[] {
  return [...products]
}

export function getProductsByCategory(category?: Product["category"], limit?: number) {
  const list = category ? products.filter((p) => p.category === category) : [...products]
  return typeof limit === "number" ? list.slice(0, limit) : list
}

export function getTopRatedProducts(limit = 6) {
  return [...products].sort((a, b) => b.rating - a.rating).slice(0, limit)
}

export function getNewArrivals(limit = 6) {
  return [...products]
    .sort((a, b) => (b.launchYear ?? 0) - (a.launchYear ?? 0))
    .slice(0, limit)
}

export function getFeaturedProducts(limit = 6) {
  const featured = products.filter((p) => p.featured)
  if (featured.length >= limit) return featured.slice(0, limit)
  return [...featured, ...getTopRatedProducts(limit)].slice(0, limit)
}

export function searchProducts(query: string, limit = 8) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []
  return products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(normalized) ||
        product.brand.toLowerCase().includes(normalized) ||
        product.description.toLowerCase().includes(normalized),
    )
    .slice(0, limit)
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

/**
 * Tìm sản phẩm có giá tương tự (chênh lệch 1-2 triệu VND)
 * @param targetPrice Giá mục tiêu (VND)
 * @param excludeId ID sản phẩm cần loại trừ
 * @param limit Số lượng tối đa
 */
export function getSimilarPriceProducts(
  targetPrice: number,
  excludeId?: string,
  limit = 6,
): Product[] {
  const minPrice = targetPrice - 2_000_000
  const maxPrice = targetPrice + 2_000_000

  return products
    .filter((p) => {
      if (excludeId && p.id === excludeId) return false
      // Lấy giá thấp nhất từ variants hoặc giá gốc
      const productPrice = p.variants?.[0]?.price ?? p.price
      return productPrice >= minPrice && productPrice <= maxPrice
    })
    .sort((a, b) => {
      // Sắp xếp theo độ chênh lệch giá gần nhất
      const priceA = a.variants?.[0]?.price ?? a.price
      const priceB = b.variants?.[0]?.price ?? b.price
      const diffA = Math.abs(priceA - targetPrice)
      const diffB = Math.abs(priceB - targetPrice)
      return diffA - diffB
    })
    .slice(0, limit)
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
