"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Zap, TrendingUp, AlertCircle } from "lucide-react"
import { predictPriceRange } from "@/lib/predict"
import { seedProducts } from "@/lib/seed-data"

type PredictInput = {
  ram_gb: number
  rom_option: string
  chip: string
  brand: string
  front_camera_mp?: number
  back_camera_mp?: number
  battery_mah?: number
  screen_size_in?: number
}

export default function PredictPage() {
  const [specs, setSpecs] = useState<PredictInput>({
    ram_gb: 8,
    rom_option: "128",
    chip: "Snapdragon 8 Gen 2",
    brand: "Samsung",
    front_camera_mp: 12,
    back_camera_mp: 48,
    battery_mah: 4000,
    screen_size_in: 6.0,
  })

  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handlePredict = async () => {
    setLoading(true)
    setError("")
    try {
      const result = await predictPriceRange(specs)
      setPrediction(result)
    } catch (err) {
      setError("Lỗi khi dự đoán. Vui lòng thử lại.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadExample = (exampleIndex: number) => {
    const example = seedProducts[exampleIndex]
    setSpecs({
      ram_gb: Math.max(4, Math.min(16, Math.round((example.specs.ram || 8192) / 1024))),
      rom_option: ((): string => {
        const gb = example.specs.int_memory || 128
        if (gb >= 2048) return "2TB"
        if (gb >= 1024) return "1TB"
        const opts = [32, 64, 128, 256, 512]
        const closest = opts.reduce((p, c) => (Math.abs(c - gb) < Math.abs(p - gb) ? c : p))
        return String(closest)
      })(),
      chip: "",
      brand: example.brand || "Other",
      front_camera_mp: example.specs.fc || 12,
      back_camera_mp: example.specs.pc || 48,
      battery_mah: example.specs.battery_power || 4000,
      screen_size_in: example.specs.sc_w || 6.0,
    })
    setPrediction(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Quay lại</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dự Đoán Giá Điện Thoại</h1>
        <p className="text-muted-foreground mb-8">
          Nhập thông số kỹ thuật và hệ thống sẽ dự đoán phạm vi giá phù hợp cho điện thoại của bạn.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Load Examples */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Tải Ví Dụ</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {seedProducts.slice(0, 4).map((product, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLoadExample(idx)}
                    className="px-3 py-2 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    {product.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Specs Input Grid */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Thông Số Kỹ Thuật</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">ROM</label>
                  <select
                    value={specs.rom_option}
                    onChange={(e) => setSpecs({ ...specs, rom_option: e.target.value })}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {['32','64','128','256','512','1TB','2TB'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">RAM (GB)</label>
                  <select
                    value={specs.ram_gb}
                    onChange={(e) => setSpecs({ ...specs, ram_gb: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {[4,6,8,12,16].map((gb) => (
                      <option key={gb} value={gb}>{gb}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Thương hiệu</label>
                  <select
                    value={specs.brand}
                    onChange={(e) => setSpecs({ ...specs, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Oppo">Oppo</option>
                    <option value="Honor">Honor</option>
                    <option value="Vivo">Vivo</option>
                    <option value="Other">Khác</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-muted-foreground mb-2 block">Chip/Vi xử lý</label>
                  <input
                    type="text"
                    value={specs.chip}
                    onChange={(e) => setSpecs({ ...specs, chip: e.target.value })}
                    placeholder="Ví dụ: Snapdragon 8 Gen 2 / A17 Pro"
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Camera trước (MP) - tùy chọn</label>
                  <input
                    type="number"
                    value={specs.front_camera_mp ?? ''}
                    onChange={(e) => setSpecs({ ...specs, front_camera_mp: Number(e.target.value) || undefined })}
                    placeholder="Mặc định 12"
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Camera sau (MP) - tùy chọn</label>
                  <input
                    type="number"
                    value={specs.back_camera_mp ?? ''}
                    onChange={(e) => setSpecs({ ...specs, back_camera_mp: Number(e.target.value) || undefined })}
                    placeholder="Mặc định 12"
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Pin (mAh) - tùy chọn</label>
                  <input
                    type="number"
                    value={specs.battery_mah ?? ''}
                    onChange={(e) => setSpecs({ ...specs, battery_mah: Number(e.target.value) || undefined })}
                    placeholder="Mặc định 4000"
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Kích thước màn hình (inch) - tùy chọn</label>
                  <input
                    type="number"
                    step="0.1"
                    value={specs.screen_size_in ?? ''}
                    onChange={(e) => setSpecs({ ...specs, screen_size_in: Number(e.target.value) || undefined })}
                    placeholder="Mặc định 6.0"
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>


              {error && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <button
                onClick={handlePredict}
                disabled={loading}
                className="w-full mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                {loading ? "Đang Dự Đoán..." : "Dự Đoán Giá"}
              </button>
            </div>
          </div>

          {/* Prediction Result */}
          <div className="lg:col-span-1">
            {prediction ? (
              <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                <h3 className="font-bold text-lg text-foreground mb-4">Kết Quả Dự Đoán</h3>

                {/* Giá dự đoán - Chỉ hiển thị giá tiền */}
                <div className="mb-6 p-6 bg-primary/10 rounded-xl border-2 border-primary/30">
                  <div className="text-sm text-muted-foreground mb-2">Giá dự đoán (tại thời điểm ra mắt)</div>
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {prediction.price_vnd.toLocaleString('vi-VN')} ₫
                  </div>
                  <div className="text-sm text-muted-foreground">
                    (~ ${prediction.price_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)
                  </div>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>Dựa trên mô hình Machine Learning đã được huấn luyện</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>Dữ liệu được thu thập từ thông tin các dòng điện thoại trên toàn thế giới</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-sm text-muted-foreground text-center">
                  Nhập thông số và nhấn "Dự Đoán Giá" để xem kết quả
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 PhoneHub VN. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
