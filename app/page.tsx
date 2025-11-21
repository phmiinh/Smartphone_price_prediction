"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ShoppingCart,
  TrendingUp,
  Zap,
  Award,
  Search,
  ShieldCheck,
  CreditCard,
  Truck,
  Calculator,
  Sparkles,
} from "lucide-react"
import ProductCard from "@/components/product-card"
import {
  getAllProducts,
  getFeaturedProducts,
  getNewArrivals,
  getTopRatedProducts,
  searchProducts,
} from "@/lib/products-db"
import { useCart } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"

export default function Home() {
  const products = getAllProducts()
  const featuredProducts = getFeaturedProducts(6)
  const topRated = getTopRatedProducts(4)
  const newArrivals = getNewArrivals(5)
  const budgetPhones = products.filter((product) => product.price_range <= 1).slice(0, 4)
  const flagshipZone = products.filter((product) => product.category === "flagship").slice(0, 4)
  const heroProduct = featuredProducts[0] ?? products[0]
  const cartItems = useCart((state) => state.getTotalItems())
  const [searchTerm, setSearchTerm] = useState("")
  const searchResults = useMemo(() => (searchTerm ? searchProducts(searchTerm, 6) : []), [searchTerm])

  const brandFilters = [...new Set(products.map((product) => product.brand))].slice(0, 8)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-4 justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              📱
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground leading-none">PhoneHub</span>
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Smartphone Mall</span>
            </div>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
            <Link href="/products" className="text-foreground hover:text-primary transition-colors">
              Sản phẩm
            </Link>
            <Link href="/comparison" className="text-foreground hover:text-primary transition-colors">
              So sánh
            </Link>
            <Link href="/predict" className="text-foreground hover:text-primary transition-colors">
              Ước tính giá
            </Link>
            <Link href="/admin" className="text-foreground hover:text-primary transition-colors">
              Quản lý
            </Link>
            <Link href="/profile" className="text-foreground hover:text-primary transition-colors hidden sm:inline">
              Hồ sơ
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center gap-1 text-foreground hover:text-primary transition-colors"
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

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 via-background to-background py-12 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Siêu thị điện thoại công nghệ
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
              Siêu thị điện thoại PhoneHub – nơi bạn chọn máy phù hợp, nhanh và minh bạch
          </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-xl">
              Danh mục cập nhật liên tục, mua online an tâm, thông tin rõ ràng như tại showroom – không cần quảng cáo
              màu mè.
            </p>
            <div className="flex flex-wrap gap-4">
            <Link
                href="/products"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
                Xem tất cả sản phẩm
            </Link>
            <Link
              href="/predict"
                className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Ước tính giá thị trường
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8 text-sm">
              <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Chính hãng 100%</p>
                  <p className="text-muted-foreground">Bảo hành điện tử, đổi trả 15 ngày</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                <Truck className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Giao nhanh 2h</p>
                  <p className="text-muted-foreground">Miễn phí với đơn từ 1 triệu</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-card border border-border rounded-3xl p-5 shadow-xl">
              <div className="relative h-72 bg-muted rounded-2xl overflow-hidden mb-5">
                {heroProduct?.images?.[0] ? (
                  <Image
                    src={heroProduct.images[0]}
                    alt={heroProduct.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    Hình sản phẩm
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur rounded-xl px-4 py-2">
                  <p className="text-xs text-muted-foreground">Sản phẩm nổi bật</p>
                  <p className="font-semibold text-foreground">{heroProduct?.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-muted-foreground text-xs">Giá từ</p>
                  <p className="text-lg font-bold text-primary">{heroProduct ? formatCurrency(heroProduct.price) : "—"}</p>
                  <p className="text-xs text-muted-foreground">Tặng ưu đãi 1.5 triệu</p>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-muted-foreground text-xs">Tình trạng</p>
                  <p className={`text-sm font-semibold ${heroProduct?.stock ? "text-green-600" : "text-destructive"}`}>
                    {heroProduct?.stock ? `Còn ${heroProduct.stock} máy` : "Hết hàng"}
                  </p>
                  <p className="text-xs text-muted-foreground">Bảo hành 18 tháng</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-4 bg-background shadow-lg border border-border rounded-2xl px-4 py-3 text-sm hidden md:flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Ưu đãi độc quyền</span>
              <strong>Trả góp 0% - Techcombank</strong>
              <span className="text-xs text-green-600">Phê duyệt trong 30 phút</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search + stats */}
      <section className="px-4 -mt-10 sm:-mt-14 relative z-10">
        <div className="max-w-7xl mx-auto bg-card border border-border rounded-2xl p-6 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Tìm kiếm nhanh</label>
              <div className="relative mt-2">
                <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tên máy, thương hiệu, ví dụ 'Galaxy A55'..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {searchTerm && (
                  <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-xl mt-2 shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.length === 0 && (
                      <p className="text-sm text-muted-foreground px-4 py-3">Không tìm thấy sản phẩm nào</p>
                    )}
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className="flex items-center justify-between px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <span className="line-clamp-1">{product.name}</span>
                        <span className="text-primary font-semibold">{formatCurrency(product.price)}</span>
            </Link>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-4 text-xs">
                {brandFilters.map((brand) => (
                  <span key={brand} className="px-3 py-1 rounded-full bg-muted text-foreground">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Flash sale hôm nay</p>
                <p className="text-2xl font-bold text-foreground">-2.000.000đ</p>
                <p className="text-xs text-green-600">Áp dụng đến 23:59</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Đơn đã xử lý</p>
                <p className="text-2xl font-bold text-foreground">1.248+</p>
                <p className="text-xs text-green-600">Trong 30 ngày</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Đánh giá trung bình</p>
                <p className="text-2xl font-bold text-foreground">4.86/5</p>
                <p className="text-xs text-green-600">Từ 3.200 khách hàng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature badges */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-start gap-3 bg-card border border-border rounded-2xl p-5">
            <Award className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Hàng chính hãng</h3>
              <p className="text-sm text-muted-foreground">VAT đầy đủ, tem bảo hành điện tử từ hãng</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-card border border-border rounded-2xl p-5">
            <Zap className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Thanh toán linh hoạt</h3>
              <p className="text-sm text-muted-foreground">Chuyển khoản, COD, ví điện tử, trả góp 0%</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-card border border-border rounded-2xl p-5">
            <TrendingUp className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Ước tính giá thông minh</h3>
              <p className="text-sm text-muted-foreground">Phân tích và ước tính giá dựa trên thông số kỹ thuật và thị trường</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section id="featured" className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Góc flagship & premium</h2>
              <p className="text-muted-foreground">Những lựa chọn tốt nhất cho người yêu công nghệ</p>
            </div>
            <Link href="/comparison" className="text-primary text-sm font-semibold hover:underline">
              So sánh nhanh &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* AI CTA */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-primary to-primary/70 rounded-3xl text-primary-foreground p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent)]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary-foreground/80">
                <Calculator className="w-4 h-4" />
                Price predictor
              </div>
              <h3 className="text-3xl font-bold mt-3 mb-4">Ước tính giá theo thông số kỹ thuật</h3>
              <p className="text-sm mb-6">
                Nhập RAM/ROM/Camera/Pin... và hệ thống sẽ phân tích và trả về giá ước tính dựa trên thị trường hiện tại.
                Công cụ hữu ích cho quy trình nhập hàng & tư vấn khách hàng.
              </p>
              <Link
                href="/predict"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors font-semibold"
              >
                Trải nghiệm ngay
                <Sparkles className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="bg-card border border-border rounded-3xl p-6 grid grid-cols-2 gap-4">
            {[
              { title: "Flash sale budget", description: "Từ 7 triệu" },
              { title: "Mua kèm bảo hành", description: "Chỉ 199k/năm" },
              { title: "Thu cũ đổi mới", description: "Hỗ trợ 40 thương hiệu" },
              { title: "Business order", description: "Chiết khấu doanh nghiệp" },
            ].map((item) => (
              <div key={item.title} className="bg-muted rounded-2xl p-4">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Budget & Flagship */}
      <section className="py-12 px-4 bg-card/40 border-y border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div id="budget">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Dưới 10 triệu</p>
                <h3 className="text-2xl font-bold text-foreground">Budget picks</h3>
              </div>
              <Link href="/products" className="text-primary text-sm font-semibold hover:underline">
                Xem thêm
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {budgetPhones.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
          <div id="flagship">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Trên 20 triệu</p>
                <h3 className="text-2xl font-bold text-foreground">Flagship zone</h3>
              </div>
              <Link href="/comparison" className="text-primary text-sm font-semibold hover:underline">
                So sánh
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {flagshipZone.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-foreground">New arrivals</h3>
            <Link href="/products" className="text-primary text-sm font-semibold hover:underline">
              Toàn bộ danh mục
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
            {newArrivals.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="bg-card border border-border rounded-2xl p-4 hover:border-primary/60 transition-colors flex flex-col gap-2"
              >
                <p className="text-xs text-muted-foreground">{product.brand}</p>
                <p className="font-semibold text-foreground line-clamp-2">{product.name}</p>
                <p className="text-primary font-bold">{formatCurrency(product.price)}</p>
                <p className="text-xs text-muted-foreground">
                  {product.launchYear} • {product.category}
                </p>
              </Link>
            ))}
          </div>
    </div>
      </section>

      {/* Top rated */}
      <section className="py-12 px-4 bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-foreground">Top rated tuần này</h3>
            <p className="text-sm text-muted-foreground">Dựa trên 500+ review thật</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {topRated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <p className="font-semibold text-foreground mb-2">PhoneHub VN</p>
            <p className="text-muted-foreground">
              Trung tâm thương mại điện thoại - giao diện tối ưu cho desktop/mobile, công cụ ước tính giá chính xác.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-2">Hỗ trợ</p>
            <p className="text-muted-foreground">1900 6868 (8h - 22h)</p>
            <p className="text-muted-foreground">support@phonehub.vn</p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-2">Thanh toán</p>
            <div className="flex gap-2 text-foreground">
              <CreditCard className="w-5 h-5" />
              <ShieldCheck className="w-5 h-5" />
              <Truck className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-8">
          &copy; {new Date().getFullYear()} PhoneHub VN. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
