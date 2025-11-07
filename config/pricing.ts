export const PRICE_RANGES = {
  0: { label: "Giá thấp", min: 2000000, max: 4000000, color: "bg-green-500", badge: "Giá thấp" },
  1: { label: "Trung bình", min: 4000000, max: 8000000, color: "bg-slate-500", badge: "Trung bình" },
  2: { label: "Cao", min: 8000000, max: 15000000, color: "bg-amber-500", badge: "Cao" },
  3: { label: "Rất cao", min: 15000000, max: 30000000, color: "bg-red-500", badge: "Rất cao" },
} as const

export const PRICE_RANGE_LABELS = ["Giá thấp", "Trung bình", "Cao", "Rất cao"] as const

export const PRICE_FILTERS = [
  { label: "Dưới 4 triệu", min: 0, max: 4000000 },
  { label: "4 - 8 triệu", min: 4000000, max: 8000000 },
  { label: "8 - 15 triệu", min: 8000000, max: 15000000 },
  { label: "Trên 15 triệu", min: 15000000, max: 30000000 },
] as const

export const BRANDS = ["Apple", "Samsung", "Xiaomi", "OPPO", "Vivo", "Realme", "Khác"] as const
