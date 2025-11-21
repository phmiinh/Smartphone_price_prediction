"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronLeft, Filter, Search, X } from "lucide-react"
import ProductCard from "@/components/product-card"
import { getAllProducts } from "@/lib/products-db"
import { BRANDS, PRICE_FILTERS } from "@/config/pricing"

const PRICE_OPTIONS = [{ label: "Tất cả", min: 0, max: Number.POSITIVE_INFINITY }, ...PRICE_FILTERS]

export default function ProductsPage() {
  const products = getAllProducts()
  const [searchTerm, setSearchTerm] = useState("")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [priceFilter, setPriceFilter] = useState<number>(0)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchBrand = brandFilter === "all" || product.brand === brandFilter
      const priceRange = PRICE_OPTIONS[priceFilter]
      const matchPrice = product.price >= priceRange.min && product.price <= priceRange.max
      const matchSearch =
        searchTerm.trim().length === 0 ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      return matchBrand && matchPrice && matchSearch
    })
  }, [products, brandFilter, priceFilter, searchTerm])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Trang chủ</span>
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Danh sách sản phẩm</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Filter className="w-4 h-4" />
              Bộ lọc
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên máy hoặc thương hiệu"
                className="w-full pl-9 pr-10 py-2 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">
                {filteredProducts.length} sản phẩm · {brandFilter === "all" ? "Tất cả thương hiệu" : brandFilter}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Thương hiệu</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setBrandFilter("all")}
                  className={`px-3 py-1 rounded-full border text-xs ${
                    brandFilter === "all" ? "border-primary text-primary bg-primary/10" : "border-border text-foreground"
                  }`}
                >
                  Tất cả
                </button>
                {BRANDS.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setBrandFilter(brand)}
                    className={`px-3 py-1 rounded-full border text-xs ${
                      brandFilter === brand ? "border-primary text-primary bg-primary/10" : "border-border text-foreground"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Khoảng giá</p>
              <div className="flex flex-wrap gap-2">
                {PRICE_OPTIONS.map((option, index) => (
                  <button
                    key={option.label}
                    onClick={() => setPriceFilter(index)}
                    className={`px-3 py-1 rounded-full border text-xs ${
                      priceFilter === index ? "border-primary text-primary bg-primary/10" : "border-border text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl p-10 text-center text-muted-foreground">
            Không tìm thấy sản phẩm phù hợp. Hãy thử điều chỉnh bộ lọc hoặc{" "}
            <Link href="/predict" className="text-primary font-semibold">
              dùng AI gợi ý giá
            </Link>
            .
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

