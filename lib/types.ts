export type Brand =
  | "Apple"
  | "Samsung"
  | "Xiaomi"
  | "OPPO"
  | "Vivo"
  | "Realme"
  | "Khác"
  | "Honor"
  | "Nothing"
  | "Google"
  | "OnePlus"
  | "Asus"
  | "Motorola"
  | "Tecno"
  | "Infinix"

export type ProductCategory = "flagship" | "premium" | "midrange" | "budget" | "gaming"
export type PriceRange = 0 | 1 | 2 | 3

export interface ProductVariant {
  label: string
  price: number
  stock?: number
}

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
  category?: ProductCategory
  chipset?: string
  launchYear?: number
  highlights?: string[]
  badges?: string[]
  colors?: string[]
  variants?: ProductVariant[]
  featured?: boolean
  comingSoon?: boolean
}

export interface CartItem {
  productId: string
  quantity: number
  variantLabel?: string
  color?: string
  unitPrice?: number
}

export interface Cart {
  items: CartItem[]
}

export interface ShippingInfo {
  fullName: string
  phone: string
  email: string
  address: string
  city: string
  district: string
  note?: string
}

export type PaymentMethod = "cod" | "momo" | "vnpay" | "bank_transfer"

export interface OrderItem {
  productId: string
  quantity: number
  price: number
  variantLabel?: string
  color?: string
}

export interface Order {
  id: string
  status: "pending" | "processing" | "paid" | "shipped" | "delivered"
  items: OrderItem[]
  subtotal: number
  total: number
  shippingFee: number
  discount?: number
  paymentMethod: PaymentMethod
  shipping: ShippingInfo
  note?: string
  createdAt: string
  eta?: string
}
