"use client"

import Link from "next/link"
import { ShoppingCart, TrendingUp, Zap, Award } from "lucide-react"
import ProductCard from "@/components/product-card"
import { getAllProducts } from "@/lib/products-db"
import { useCart } from "@/lib/store"

export default function Home() {
  const products = getAllProducts()
  const cartItems = useCart((state) => state.getTotalItems())

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              📱
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">PhoneHub VN</span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/comparison"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              So Sánh
            </Link>
            <Link href="/predict" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Dự Đoán Giá
            </Link>
            <Link href="/admin" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Quản Lý
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Điện Thoại Di Động Chất Lượng Cao
          </h1>
          <p className="text-lg text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Khám phá bộ sưu tập điện thoại di động mới nhất từ các thương hiệu hàng đầu thế giới với giá tốt nhất tại
            Việt Nam.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="#products"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Mua Ngay
            </Link>
            <Link
              href="/predict"
              className="px-6 py-3 bg-card border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
            >
              Dự Đoán Giá
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center gap-3">
            <Award className="w-8 h-8 text-primary" />
            <h3 className="font-semibold text-foreground">Chính Hãng 100%</h3>
            <p className="text-sm text-muted-foreground">Tất cả sản phẩm đều chính hãng có bảo hành</p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <Zap className="w-8 h-8 text-primary" />
            <h3 className="font-semibold text-foreground">Giao Hàng Nhanh</h3>
            <p className="text-sm text-muted-foreground">Miễn phí vận chuyển cho đơn hàng trên 1 triệu</p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h3 className="font-semibold text-foreground">Giá Tốt Nhất</h3>
            <p className="text-sm text-muted-foreground">Giảm giá hàng tuần, so sánh giá miễn phí</p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-2">Sản Phẩm Nổi Bật</h2>
            <p className="text-muted-foreground">
              Khám phá những chiếc điện thoại mới nhất từ các thương hiệu hàng đầu
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 PhoneHub VN. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
