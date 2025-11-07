"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import type { Product } from "@/lib/types"

interface AdminProductModalProps {
  product: Product | null
  onSave: (product: Product) => void
  onClose: () => void
}

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
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
          <h2 className="text-xl font-bold text-foreground">{product ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Tên Sản Phẩm</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Thương Hiệu</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value as any })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>Apple</option>
                <option>Samsung</option>
                <option>Xiaomi</option>
                <option>OPPO</option>
                <option>Vivo</option>
                <option>Realme</option>
                <option>Khác</option>
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
              <label className="text-sm text-muted-foreground mb-2 block">Hàng Có Sẵn</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Mô Tả</label>
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
              {product ? "Cập Nhật" : "Thêm Mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
