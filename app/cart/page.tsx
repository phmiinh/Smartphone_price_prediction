"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Trash2, Plus, Minus } from "lucide-react"
import { useCart } from "@/lib/store"
import { getProductById } from "@/lib/products-db"
import type { Product } from "@/lib/types"

export default function CartPage() {
  const cartItems = useCart((state) => state.items)
  const removeItem = useCart((state) => state.removeItem)
  const updateQuantity = useCart((state) => state.updateQuantity)
  const clearCart = useCart((state) => state.clearCart)

  const [products, setProducts] = useState<Record<string, Product | undefined>>({})
  const [mounted, setMounted] = useState(false)

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
    return sum + (product ? product.price * item.quantity : 0)
  }, 0)

  const formattedTotal = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(totalPrice)

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

                const formattedPrice = new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  maximumFractionDigits: 0,
                }).format(product.price)

                return (
                  <div key={item.productId} className="bg-card border border-border rounded-xl p-4 flex gap-4">
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
                      <p className="text-sm text-muted-foreground mb-3">{product.brand}</p>
                      <p className="font-bold text-primary">{formattedPrice}</p>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-destructive hover:text-destructive/80 transition-colors p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          className="px-2 py-1 text-foreground hover:bg-muted transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 text-foreground font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-1 text-foreground hover:bg-muted transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                          maximumFractionDigits: 0,
                        }).format(product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                <h2 className="text-lg font-bold text-foreground mb-4">Tóm Tắt Đơn Hàng</h2>

                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Số lượng sản phẩm:</span>
                    <span className="font-medium text-foreground">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span className="font-medium text-foreground">{formattedTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vận chuyển:</span>
                    <span className="font-medium text-green-600">Miễn phí</span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="font-bold text-foreground">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-primary">{formattedTotal}</span>
                </div>

                <button className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors mb-3">
                  Thanh Toán
                </button>

                <button
                  onClick={clearCart}
                  className="w-full px-6 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
                >
                  Xóa Giỏ Hàng
                </button>

                <div className="mt-6 p-4 bg-primary/10 rounded-lg text-sm text-foreground">
                  <p className="font-semibold mb-2">Lợi ích của bạn:</p>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>✓ Chính hãng 100%</li>
                    <li>✓ Giao hàng nhanh</li>
                    <li>✓ Bảo hành từ 12 tháng</li>
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
