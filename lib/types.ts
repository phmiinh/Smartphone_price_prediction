export type Brand = "Apple" | "Samsung" | "Xiaomi" | "OPPO" | "Vivo" | "Realme" | "Khác"
export type PriceRange = 0 | 1 | 2 | 3

export interface ProductSpecs {
  ram: number // MB
  int_memory: number // GB
  battery_power: number // mAh
  px_width: number
  px_height: number
  sc_w: number
  sc_h: number
  pc: number // Primary camera
  fc: number // Front camera
  n_cores: number
  clock_speed: number // GHz
  mobile_wt: number // grams
  m_dep: number // mm
  talk_time: number // hours
  blue: 0 | 1
  dual_sim: 0 | 1
  four_g: 0 | 1
  three_g: 0 | 1
  touch_screen: 0 | 1
  wifi: 0 | 1
}

export interface Product {
  id: string
  slug: string
  name: string
  brand: Brand
  price: number // VND
  price_range: PriceRange
  images: string[]
  stock: number
  rating: number // 0-5
  specs: ProductSpecs
  description: string
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface Cart {
  items: CartItem[]
}
