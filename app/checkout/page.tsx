"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, Truck, ShieldCheck, CreditCard, Zap } from "lucide-react"
import { useCart } from "@/lib/store"
import { getProductById } from "@/lib/products-db"
import type { Product } from "@/lib/types"
import { useOrders } from "@/lib/orders-store"
import { formatCurrency } from "@/lib/utils"

const paymentMethods = [
  { id: "cod", label: "Thanh toán khi nhận hàng (COD)" },
  { id: "momo", label: "Ví MoMo" },
  { id: "vnpay", label: "VNPay QR" },
  { id: "bank_transfer", label: "Chuyển khoản ngân hàng" },
] as const

const shippingOptions = [
  {
    id: "express",
    label: "Siêu tốc 2h",
    fee: 50000,
    description: "Áp dụng nội thành Hà Nội/HCM",
    eta: "2-4h",
  },
  {
    id: "standard",
    label: "Tiêu chuẩn",
    fee: 0,
    description: "Toàn quốc 3-5 ngày",
    eta: "3-5 ngày",
  },
  {
    id: "store",
    label: "Nhận tại store",
    fee: 0,
    description: "Giữ máy 48h tại showroom",
    eta: "Hẹn trong ngày",
  },
] as const

export default function CheckoutPage() {
  const cartItems = useCart((state) => state.items)
  const clearCart = useCart((state) => state.clearCart)
  const [products, setProducts] = useState<Record<string, Product | undefined>>({})
  const [mounted, setMounted] = useState(false)
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    district: "",
    note: "",
  })
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentMethods)[number]["id"]>("cod")
  const [selectedShipping, setSelectedShipping] = useState<(typeof shippingOptions)[number]>(shippingOptions[0])
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const createOrder = useOrders((state) => state.createOrder)

  useEffect(() => {
    setMounted(true)
    const map: Record<string, Product | undefined> = {}
    cartItems.forEach((item) => {
      map[item.productId] = getProductById(item.productId)
    })
    setProducts(map)
  }, [cartItems])

  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const product = products[item.productId]
        return sum + (product ? product.price * item.quantity : 0)
      }, 0),
    [cartItems, products],
  )

  const total = subtotal + selectedShipping.fee

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!cartItems.length || submitting) return

    setSubmitting(true)
    try {
      const order = createOrder({
        items: cartItems.map((item) => {
          const product = products[item.productId]
          const unitPrice = item.unitPrice ?? product?.price ?? 0
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: unitPrice,
            variantLabel: item.variantLabel,
            color: item.color,
          }
        }),
        subtotal,
        shippingFee: selectedShipping.fee,
        paymentMethod,
        shipping: {
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          district: form.district,
          note: form.note,
        },
        note: form.note,
        eta: selectedShipping.eta,
      })
      clearCart()
      router.push(`/orders/${order.id}?success=1`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-lg text-muted-foreground">Giỏ hàng của bạn đang trống</p>
        <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold">
          Quay lại mua sắm
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Tiếp tục mua sắm</span>
          </Link>
          <p className="text-sm text-muted-foreground">Bảo mật SSL • Hỗ trợ 1900 6868</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">1. Thông tin nhận hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                placeholder="Họ và tên"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                required
                placeholder="Số điện thoại"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="email"
                placeholder="Email nhận hóa đơn (tùy chọn)"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary md:col-span-2"
              />
              <input
                required
                placeholder="Địa chỉ"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary md:col-span-2"
              />
              <input
                required
                placeholder="Thành phố / Tỉnh"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                required
                placeholder="Quận / Huyện"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <textarea
              placeholder="Ghi chú cho shipper (ví dụ: Giao giờ hành chính, gọi trước khi giao...)"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="mt-4 w-full rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">2. Vận chuyển & thanh toán</h2>
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Phương thức giao hàng</p>
                <div className="grid gap-3">
                  {shippingOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center justify-between border rounded-2xl px-4 py-3 cursor-pointer ${
                        selectedShipping.id === option.id ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">
                          {option.fee === 0 ? "Miễn phí" : formatCurrency(option.fee)}
                        </p>
                        <p className="text-xs text-muted-foreground">ETD: {option.eta}</p>
                      </div>
                      <input
                        type="radio"
                        className="sr-only"
                        checked={selectedShipping.id === option.id}
                        onChange={() => setSelectedShipping(option)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Phương thức thanh toán</p>
                <div className="grid gap-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-3 border rounded-2xl px-4 py-3 cursor-pointer ${
                        paymentMethod === method.id ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                      />
                      <span className="text-sm text-foreground">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Thanh toán bảo mật bởi VietQR/VNPay
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Truck className="w-4 h-4 text-primary" />
              Giao nhanh 2h với tùy chọn siêu tốc
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CreditCard className="w-4 h-4 text-primary" />
              Trả góp 0% qua thẻ tín dụng
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Đang tạo đơn..." : `Đặt hàng ${formatCurrency(total)}`}
          </button>
        </form>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-foreground">Đơn hàng của bạn</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {cartItems.map((item) => {
              const product = products[item.productId]
              if (!product) return null
              const unitPrice = item.unitPrice ?? product.price
              return (
                <div
                  key={`${item.productId}-${item.variantLabel ?? "base"}-${item.color ?? "default"}`}
                  className="flex gap-3"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted">
                    <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground line-clamp-2">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.brand} • SL: {item.quantity}
                    </p>
                    {item.variantLabel && (
                      <p className="text-xs text-muted-foreground">Phiên bản: {item.variantLabel}</p>
                    )}
                    {item.color && <p className="text-xs text-muted-foreground">Màu: {item.color}</p>}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(unitPrice * item.quantity)}</p>
                </div>
              )
            })}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Tạm tính</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Phí vận chuyển</span>
              <span>{selectedShipping.fee === 0 ? "Miễn phí" : formatCurrency(selectedShipping.fee)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
              <span>Tổng cộng</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Đã bao gồm VAT, chưa áp dụng voucher.</p>
          </div>

          <div className="bg-primary/10 rounded-2xl p-4 text-sm text-foreground">
            <p className="font-semibold mb-2">AI Price Companion</p>
            <p className="text-muted-foreground">
              Muốn kiểm tra giá nhập phù hợp? Nhấn{" "}
              <Link href="/predict" className="text-primary font-semibold">
                Dự đoán giá
              </Link>{" "}
              và nhập cấu hình tương tự, hệ thống FastAPI (.pkl) sẽ trả về giá tham chiếu tức thì.
            </p>
          </div>

          <div className="text-xs text-muted-foreground flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-primary" />
              Miễn phí đổi trả 15 ngày nếu máy lỗi nhà sản xuất
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Bảo hành chính hãng 12-24 tháng và gia hạn điện tử
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

