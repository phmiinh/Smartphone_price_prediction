"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, X, Plus, ShoppingCart } from "lucide-react"
import { getAllProducts } from "@/lib/products-db"
import { useCart } from "@/lib/store"
import type { Product } from "@/lib/types"

export default function ComparisonPage() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [showSelector, setShowSelector] = useState(false)
  const [mounted, setMounted] = useState(false)
  const addItem = useCart((state) => state.addItem)

  useEffect(() => {
    setMounted(true)
    setAllProducts(getAllProducts())
  }, [])

  const handleAddProduct = (product: Product) => {
    if (selectedProducts.find((p) => p.id === product.id)) return
    if (selectedProducts.length < 4) {
      setSelectedProducts([...selectedProducts, product])
    }
  }

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId))
  }

  const specGroups = [
    {
      label: "Bộ Xử Lý & Bộ Nhớ",
      specs: [
        { key: "ram", label: "RAM", format: (v: number) => `${v / 1024}GB` },
        { key: "int_memory", label: "Bộ Nhớ Trong", format: (v: number) => `${v}GB` },
        { key: "n_cores", label: "Số Lõi", format: (v: number) => `${v}` },
        { key: "clock_speed", label: "Tốc Độ Xung Nhịp", format: (v: number) => `${v}GHz` },
      ],
    },
    {
      label: "Màn Hình",
      specs: [
        { key: "sc_w", label: "Kích Thước", format: (v: number) => `${v}"` },
        { key: "px_width", label: "Độ Phân Giải", format: (v: number) => `${v}px` },
        { key: "px_height", label: "Độ Cao Pixel", format: (v: number) => `${v}px` },
      ],
    },
    {
      label: "Camera",
      specs: [
        { key: "pc", label: "Camera Chính", format: (v: number) => `${v}MP` },
        { key: "fc", label: "Camera Trước", format: (v: number) => `${v}MP` },
      ],
    },
    {
      label: "Pin & Kết Nối",
      specs: [
        { key: "battery_power", label: "Dung Lượng Pin", format: (v: number) => `${v}mAh` },
        { key: "talk_time", label: "Thời Gian Nói Chuyện", format: (v: number) => `${v}h` },
        { key: "four_g", label: "4G", format: (v: number) => (v ? "Có" : "Không") },
        { key: "wifi", label: "WiFi", format: (v: number) => (v ? "Có" : "Không") },
      ],
    },
    {
      label: "Kích Thước & Trọng Lượng",
      specs: [
        { key: "mobile_wt", label: "Trọng Lượng", format: (v: number) => `${v}g` },
        { key: "m_dep", label: "Độ Dày", format: (v: number) => `${v}mm` },
      ],
    },
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Đang tải...</p>
      </div>
    )
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
        <h1 className="text-3xl font-bold text-foreground mb-2">So Sánh Sản Phẩm</h1>
        <p className="text-muted-foreground mb-8">Chọn tối đa 4 sản phẩm để so sánh thông số kỹ thuật và giá cả</p>

        {selectedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Chưa chọn sản phẩm nào</p>
            <button
              onClick={() => setShowSelector(true)}
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Chọn Sản Phẩm
            </button>
          </div>
        ) : (
          <>
            {/* Selected Products Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {selectedProducts.map((product) => (
                <div key={product.id} className="bg-card border border-border rounded-xl p-4 relative group">
                  <button
                    onClick={() => handleRemoveProduct(product.id)}
                    className="absolute top-2 right-2 p-1 bg-destructive/10 text-destructive rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="relative h-32 bg-muted rounded-lg mb-4 overflow-hidden">
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-primary font-bold text-sm mb-3">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        maximumFractionDigits: 0,
                      }).format(product.price)}
                    </p>
                    <button
                      onClick={() => addItem(product.id, 1, { unitPrice: product.price })}
                      className="w-full px-2 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Thêm
                    </button>
                  </div>
                </div>
              ))}

              {selectedProducts.length < 4 && (
                <button
                  onClick={() => setShowSelector(true)}
                  className="bg-card border-2 border-dashed border-border rounded-xl p-4 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Comparison Table */}
            <div className="space-y-6">
              {specGroups.map((group) => (
                <div key={group.label} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="bg-muted/50 px-6 py-4 border-b border-border">
                    <h2 className="font-bold text-foreground">{group.label}</h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody>
                        {group.specs.map((spec) => (
                          <tr key={spec.key} className="border-b border-border last:border-b-0">
                            <td className="px-6 py-4 font-medium text-sm text-foreground bg-muted/30 w-40 flex-shrink-0">
                              {spec.label}
                            </td>
                            {selectedProducts.map((product) => (
                              <td key={`${product.id}-${spec.key}`} className="px-6 py-4 text-sm text-foreground">
                                {spec.format((product.specs as any)[spec.key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Product Selector Modal */}
        {showSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl border border-border max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
                <h2 className="text-xl font-bold text-foreground">Chọn Sản Phẩm</h2>
                <button
                  onClick={() => setShowSelector(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-2 gap-4 max-h-[calc(80vh-100px)] overflow-y-auto">
                {allProducts
                  .filter((p) => !selectedProducts.find((sp) => sp.id === p.id))
                  .map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        handleAddProduct(product)
                        if (selectedProducts.length + 1 >= 4) {
                          setShowSelector(false)
                        }
                      }}
                      className="p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="relative h-24 bg-muted rounded-lg mb-3 overflow-hidden">
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">{product.name}</h3>
                      <p className="text-primary font-bold text-xs">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                          maximumFractionDigits: 0,
                        }).format(product.price)}
                      </p>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
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
