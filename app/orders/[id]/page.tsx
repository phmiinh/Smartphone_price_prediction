"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, Truck, CheckCircle, Clock, MapPin } from "lucide-react"
import { useOrders } from "@/lib/orders-store"
import { getProductById } from "@/lib/products-db"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/lib/types"

interface OrderDetailPageProps {
  params: {
    id: string
  }
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const searchParams = useSearchParams()
  const orders = useOrders((state) => state.orders)
  const order = orders.find((o) => o.id === params.id)
  const [productMap, setProductMap] = useState<Record<string, Product | undefined>>({})

  useEffect(() => {
    if (!order) return
    const map: Record<string, Product | undefined> = {}
    order.items.forEach((item) => {
      map[item.productId] = getProductById(item.productId)
    })
    setProductMap(map)
  }, [order])

  const statusSteps = [
    { id: "processing", label: "Đang xử lý" },
    { id: "paid", label: "Đã thanh toán" },
    { id: "shipped", label: "Đang giao" },
    { id: "delivered", label: "Hoàn tất" },
  ] as const

  const success = searchParams.get("success") === "1"

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-lg text-muted-foreground">Không tìm thấy đơn hàng #{params.id}</p>
        <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold">
          Quay lại trang chủ
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Tiếp tục mua sắm</span>
          </Link>
          <p className="text-sm text-muted-foreground">Mã đơn: {order.id}</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-4 py-3 flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            Đặt hàng thành công! Chúng tôi sẽ liên hệ xác nhận trong vòng 15 phút.
          </div>
        )}

        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground mb-2">Trạng thái đơn hàng</h2>
          <div className="grid grid-cols-4 gap-4 text-center text-xs uppercase tracking-wide">
            {statusSteps.map((step, index) => {
              const stepIndex = statusSteps.findIndex((s) => s.id === order.status)
              const isActive = index <= stepIndex
              return (
                <div key={step.id} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isActive ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <span className={isActive ? "text-foreground font-semibold" : "text-muted-foreground"}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Truck className="w-4 h-4 text-primary" />
            {order.status === "delivered"
              ? "Đơn hàng đã được giao thành công."
              : `Dự kiến giao: ${order.eta ? new Date(order.eta).toLocaleDateString("vi-VN") : "Đang cập nhật"}`}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Thông tin giao hàng</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="text-foreground font-medium">{order.shipping.fullName}</p>
              <p>{order.shipping.phone}</p>
              {order.shipping.email && <p>{order.shipping.email}</p>}
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span>
                  {order.shipping.address}, {order.shipping.district}, {order.shipping.city}
                </span>
              </p>
              {order.shipping.note && <p className="italic text-xs">Ghi chú: {order.shipping.note}</p>}
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Thanh toán</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Vận chuyển</span>
                <span>{order.shippingFee === 0 ? "Miễn phí" : formatCurrency(order.shippingFee)}</span>
              </div>
              {order.discount ? (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-lg font-bold text-foreground border-t border-border pt-2">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
              <p className="text-xs">Phương thức: {order.paymentMethod.toUpperCase()}</p>
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Danh sách sản phẩm</h3>
            <Link href="/comparison" className="text-primary text-sm font-semibold hover:underline">
              So sánh thêm
            </Link>
          </div>
          <div className="space-y-4">
            {order.items.map((item) => {
              const product = productMap[item.productId]
              return (
                <div
                  key={`${item.productId}-${item.variantLabel ?? "base"}-${item.color ?? "default"}`}
                  className="flex items-center gap-4 border border-border rounded-2xl p-4"
                >
                  <div className="relative w-20 h-20 bg-muted rounded-xl overflow-hidden">
                    {product?.images?.[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {product?.name ?? "Sản phẩm đã xóa"} x{item.quantity}
                    </p>
                    {item.variantLabel && (
                      <p className="text-xs text-muted-foreground">Phiên bản: {item.variantLabel}</p>
                    )}
                    {item.color && <p className="text-xs text-muted-foreground">Màu: {item.color}</p>}
                    {product?.chipset && <p className="text-xs text-muted-foreground">{product.chipset}</p>}
                  </div>
                  <p className="font-semibold text-foreground">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              )
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="flex gap-2 p-4 bg-card border border-border rounded-2xl">
            <Clock className="w-4 h-4 text-primary" />
            <p>Thời gian đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
          </div>
          <div className="flex gap-2 p-4 bg-card border border-border rounded-2xl">
            <CheckCircle className="w-4 h-4 text-primary" />
            <p>Trạng thái hiện tại: {order.status.toUpperCase()}</p>
          </div>
          <div className="flex gap-2 p-4 bg-card border border-border rounded-2xl">
            <Truck className="w-4 h-4 text-primary" />
            <p>Dự kiến giao: {order.eta ? new Date(order.eta).toLocaleDateString("vi-VN") : "Đang cập nhật"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

