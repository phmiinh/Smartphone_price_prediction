"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Trash2, Plus, Minus } from "lucide-react"
import { useCart } from "@/lib/store"
import { getProductById } from "@/lib/products-db"
import type { Product } from "@/lib/types"
import { formatCurrency, stringToColor } from "@/lib/utils"

export default function CartPage() {
  const cartItems = useCart((state) => state.items)
  const removeItem = useCart((state) => state.removeItem)
  const updateQuantity = useCart((state) => state.updateQuantity)
  const clearCart = useCart((state) => state.clearCart)

  const [products, setProducts] = useState<Record<string, Product | undefined>>({})
  const [mounted, setMounted] = useState(false)
  const shippingOptions = [
    {
      id: "express",
      label: "Siêu tốc 2h",
      fee: 50000,
      description: "Áp dụng nội thành Hà Nội/HCM",
    },
    {
      id: "standard",
      label: "Tiêu chuẩn",
      fee: 0,
      description: "3-5 ngày toàn quốc",
    },
    {
      id: "store",
      label: "Nhận tại store",
      fee: 0,
      description: "Giữ hàng 48h tại chi nhánh",
    },
  ] as const
  const [selectedShipping, setSelectedShipping] = useState<(typeof shippingOptions)[number]>(shippingOptions[1])
  const [note, setNote] = useState("")
  const [voucher, setVoucher] = useState("")

  useEffect(() => {
    setMounted(true)
    // Load products for cart items
    const productsMap: Record<string, Product | undefined> = {}
    cartItems.forEach((item) => {
      productsMap[item.productId] = getProductById(item.productId)
    })
    setProducts(productsMap)
  }, [cartItems])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  const totalPrice = cartItems.reduce((sum, item) => {
    const product = products[item.productId]
    const unitPrice = item.unitPrice ?? product?.price ?? 0
    return sum + unitPrice * item.quantity
  }, 0)

  const grandTotal = totalPrice + selectedShipping.fee
  const formattedTotal = formatCurrency(totalPrice)
  const formattedGrandTotal = formatCurrency(grandTotal)

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
        <h1 className="text-3xl font-bold text-foreground mb-8">Giỏ Hàng</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">Giỏ hàng của bạn trống</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Tiếp Tục Mua Sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = products[item.productId]
                if (!product) return null

                const unitPrice = item.unitPrice ?? product.price
                const selectionKey = `${item.productId}-${item.variantLabel ?? "base"}-${item.color ?? "default"}`

                return (
                  <div key={selectionKey} className="bg-card border border-border rounded-xl p-4 flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                      <Image
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow min-w-0">
                      <Link href={`/product/${product.slug}`} className="block mb-2">
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors truncate">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
                      {item.variantLabel && (
                        <p className="text-xs text-muted-foreground">Phiên bản: {item.variantLabel}</p>
                      )}
                      {item.color && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          Màu: {item.color}
                          <span
                            className="inline-block w-3 h-3 rounded-full border"
                            style={{ backgroundColor: stringToColor(item.color) }}
                          />
                        </p>
                      )}
                      <p className="font-bold text-primary mt-2">{formatCurrency(unitPrice)}</p>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <button
                        onClick={() => removeItem(item.productId, { variantLabel: item.variantLabel, color: item.color })}
                        className="text-destructive hover:text-destructive/80 transition-colors p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, Math.max(1, item.quantity - 1), {
                              variantLabel: item.variantLabel,
                              color: item.color,
                            })
                          }
                          className="px-2 py-1 text-foreground hover:bg-muted transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 text-foreground font-medium">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1, {
                              variantLabel: item.variantLabel,
                              color: item.color,
                            })
                          }
                          className="px-2 py-1 text-foreground hover:bg-muted transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                <h2 className="text-lg font-bold text-foreground mb-4">Tóm tắt đơn hàng</h2>

                <div className="space-y-3 mb-6">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">Chọn vận chuyển</label>
                    <div className="space-y-2 mt-3">
                      {shippingOptions.map((option) => (
                        <label
                          key={option.id}
                          className={`flex justify-between items-center border rounded-xl px-3 py-2 cursor-pointer ${
                            selectedShipping.id === option.id ? "border-primary bg-primary/5" : "border-border bg-muted/40"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">{option.label}</p>
                            <p className="text-xs text-muted-foreground">{option.description}</p>
                          </div>
                          <input
                            type="radio"
                            checked={selectedShipping.id === option.id}
                            onChange={() => setSelectedShipping(option)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">Ghi chú cho shop</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ví dụ: Giao giờ hành chính, xuất hóa đơn..."
                      className="mt-2 w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">Mã giảm giá</label>
                    <div className="mt-2 flex gap-2">
                      <input
                        value={voucher}
                        onChange={(e) => setVoucher(e.target.value)}
                        placeholder="Nhập mã"
                        className="flex-grow rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button className="px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                        Áp dụng
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium text-foreground">{formattedTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vận chuyển</span>
                    <span className="font-medium text-foreground">
                      {selectedShipping.fee === 0 ? "Miễn phí" : formatCurrency(selectedShipping.fee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-foreground pt-2">
                    <span>Tổng cộng</span>
                    <span className="text-primary">{formattedGrandTotal}</span>
                  </div>
                </div>

                <Link
                  href={cartItems.length ? "/checkout" : "/"}
                  className={`block text-center w-full px-6 py-3 rounded-lg font-semibold transition-colors mb-3 ${
                    cartItems.length
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {cartItems.length ? "Thanh toán" : "Giỏ hàng trống"}
                </Link>

                <button
                  onClick={clearCart}
                  className="w-full px-6 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
                >
                  Xóa giỏ hàng
                </button>

                <div className="mt-6 p-4 bg-primary/10 rounded-lg text-sm text-foreground">
                  <p className="font-semibold mb-2">Lợi ích của bạn:</p>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>✓ Chính hãng 100%</li>
                    <li>✓ Giao hàng nhanh 2h tại HN/HCM</li>
                    <li>✓ Bảo hành tối thiểu 12 tháng</li>
                    <li>✓ Tư vấn AI dự đoán giá ngay tại trang thanh toán</li>
                  </ul>
                </div>
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
