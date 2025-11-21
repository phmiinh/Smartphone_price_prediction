"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import type { Product, ProductVariant, ProductCategory } from "@/lib/types"

interface AdminProductModalProps {
  product: Product | null
  onSave: (product: Product) => void
  onClose: () => void
}

const brandOptions = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "OPPO",
  "Vivo",
  "Realme",
  "Khác",
  "Honor",
  "Nothing",
  "Google",
  "OnePlus",
  "Asus",
  "Motorola",
  "Tecno",
  "Infinix",
] as const

const categories: ProductCategory[] = ["flagship", "premium", "midrange", "budget", "gaming"]

export default function AdminProductModal({ product, onSave, onClose }: AdminProductModalProps) {
  const [formData, setFormData] = useState<Product>(
    product || {
      id: `p${Date.now()}`,
      slug: "",
      name: "",
      brand: "Apple",
      price: 0,
      price_range: 0,
      images: [],
      stock: 0,
      rating: 4,
      specs: {
        ram: 8192,
        int_memory: 256,
        battery_power: 4000,
        px_width: 2400,
        px_height: 1080,
        sc_w: 6.1,
        sc_h: 6.1,
        pc: 48,
        fc: 12,
        n_cores: 6,
        clock_speed: 3.0,
        mobile_wt: 180,
        m_dep: 8.5,
        talk_time: 20,
        blue: 1,
        dual_sim: 1,
        four_g: 1,
        three_g: 1,
        touch_screen: 1,
        wifi: 1,
      },
      description: "",
      colors: [],
      badges: [],
      highlights: [],
      chipset: "",
      category: "midrange",
      variants: [],
      launchYear: new Date().getFullYear(),
    },
  )
  const [imagesInput, setImagesInput] = useState((product?.images ?? []).join(", "))
  const [badgesInput, setBadgesInput] = useState((product?.badges ?? []).join(", "))
  const [colorsInput, setColorsInput] = useState((product?.colors ?? []).join(", "))
  const [highlightsInput, setHighlightsInput] = useState((product?.highlights ?? []).join("\n"))
  const [variantsInput, setVariantsInput] = useState(
    (product?.variants ?? []).map((variant) => `${variant.label}:${variant.price}`).join(", "),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const slugified =
      formData.slug ||
      formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    onSave({ ...formData, slug: slugified })
  }

  const handleVariantParse = (value: string) => {
    setVariantsInput(value)
    const variants = value
      .split(",")
      .map((segment) => {
        const [labelRaw, priceRaw] = segment.split(":")
        if (!labelRaw || !priceRaw) return null
        const label = labelRaw.trim()
        const price = Number.parseInt(priceRaw.replace(/[^\d]/g, ""), 10)
        if (!label || Number.isNaN(price)) return null
        return { label, price }
      })
      .filter(Boolean) as ProductVariant[]
    setFormData({ ...formData, variants })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
          <h2 className="text-xl font-bold text-foreground">{product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Tên sản phẩm</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generate nếu bỏ trống"
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Thương hiệu</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value as any })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {brandOptions.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Danh mục</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Giá (VND)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Hàng có sẵn</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Chipset</label>
              <input
                type="text"
                value={formData.chipset ?? ""}
                onChange={(e) => setFormData({ ...formData, chipset: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Năm ra mắt</label>
              <input
                type="number"
                value={formData.launchYear ?? new Date().getFullYear()}
                onChange={(e) => setFormData({ ...formData, launchYear: Number.parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Ảnh (phân tách bằng dấu phẩy)</label>
              <textarea
                value={imagesInput}
                onChange={(e) => {
                  setImagesInput(e.target.value)
                  setFormData({
                    ...formData,
                    images: e.target.value
                      .split(",")
                      .map((url) => url.trim())
                      .filter(Boolean),
                  })
                }}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Badges (dấu phẩy)</label>
              <input
                type="text"
                value={badgesInput}
                onChange={(e) => {
                  setBadgesInput(e.target.value)
                  setFormData({
                    ...formData,
                    badges: e.target.value
                      .split(",")
                      .map((badge) => badge.trim())
                      .filter(Boolean),
                  })
                }}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Màu sắc (dấu phẩy)</label>
              <input
                type="text"
                value={colorsInput}
                onChange={(e) => {
                  setColorsInput(e.target.value)
                  setFormData({
                    ...formData,
                    colors: e.target.value
                      .split(",")
                      .map((color) => color.trim())
                      .filter(Boolean),
                  })
                }}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Variants (ví dụ 256GB:14990000)</label>
              <input
                type="text"
                value={variantsInput}
                onChange={(e) => handleVariantParse(e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Highlights (mỗi dòng một lợi ích)</label>
            <textarea
              value={highlightsInput}
              onChange={(e) => {
                setHighlightsInput(e.target.value)
                setFormData({
                  ...formData,
                  highlights: e.target.value
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-grow px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-grow px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              {product ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
