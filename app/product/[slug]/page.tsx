"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { ChevronLeft, Heart, Share2, Star, ShoppingCart, Zap, Battery, Wifi, Sparkles, Palette } from "lucide-react"
import { getProductBySlug, getRelatedProducts, getSimilarPriceProducts, getAllProducts } from "@/lib/products-db"
import { useCart } from "@/lib/store"
import ProductCard from "@/components/product-card"
import SpecsGrid from "@/components/specs-grid"
import { predictPriceRange, type PredictResponse } from "@/lib/predict"
import { formatCurrency, stringToColor } from "@/lib/utils"
import type { Product } from "@/lib/types"

export default function ProductDetailPage() {
  const params = useParams()
  // Xử lý slug - có thể là string hoặc array
  const slugRaw = params?.slug
  const slug = Array.isArray(slugRaw) ? slugRaw[0] : (slugRaw as string | undefined)
  
  const product = slug ? getProductBySlug(slug) : undefined
  
  // Debug: log để kiểm tra
  useEffect(() => {
    if (slug) {
      console.log("🔍 Product slug from URL:", slug)
      const found = getProductBySlug(slug)
      console.log("📦 Product found:", found?.name || "NOT FOUND")
      if (!found) {
        console.log("❌ Available slugs:", getAllProducts().map(p => p.slug).slice(0, 5))
      }
    }
  }, [slug])
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)
  const [aiPrice, setAiPrice] = useState<PredictResponse | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [variantIndex, setVariantIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState<string | null>(product?.colors?.[0] ?? null)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const addItem = useCart((state) => state.addItem)

  if (!slug) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Không tìm thấy sản phẩm</h1>
          <Link href="/" className="text-primary hover:underline">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addItem(product.id, quantity, {
      variantLabel: selectedVariant?.label,
      color: selectedColor ?? undefined,
      unitPrice: displayPriceNumber,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const relatedProducts = product ? getRelatedProducts(slug) : []
  const selectedVariant = product.variants?.[variantIndex]
  const displayPriceNumber = selectedVariant?.price ?? product.price
  const formattedPrice = formatCurrency(displayPriceNumber)
  const aiDiff = aiPrice ? displayPriceNumber - aiPrice.price_vnd : 0

  useEffect(() => {
    let ignore = false
    const brandMap: Record<string, "Apple" | "Samsung" | "Oppo" | "Honor" | "Vivo" | "Other"> = {
      Apple: "Apple",
      Samsung: "Samsung",
      OPPO: "Oppo",
      Vivo: "Vivo",
      Honor: "Honor",
      Realme: "Other",
      Xiaomi: "Other",
      Nothing: "Other",
      Google: "Other",
      OnePlus: "Other",
      Asus: "Other",
      Motorola: "Other",
      Tecno: "Other",
      Infinix: "Other",
      Khác: "Other",
    }

    const fetchAiPrice = async () => {
      if (!product) return
      setAiLoading(true)
      try {
        const payload = {
          ram_gb: Math.round(product.specs.ram / 1024),
          rom_option:
            product.specs.int_memory >= 1024
              ? `${product.specs.int_memory / 1024}TB`
              : `${product.specs.int_memory}`,
          chip: product.chipset || `${product.brand} custom silicon`,
          brand: brandMap[product.brand] || "Other",
          front_camera_mp: product.specs.fc,
          back_camera_mp: product.specs.pc,
          battery_mah: product.specs.battery_power,
          screen_size_in: product.specs.sc_w,
        }
        const response = await predictPriceRange(payload)
        if (!ignore) {
          setAiPrice(response)
          // Tìm sản phẩm tương tự dựa trên giá dự đoán (chênh lệch 1-2 triệu)
          const similar = getSimilarPriceProducts(response.price_vnd, product.id, 4)
          setSimilarProducts(similar)
        }
      } catch (error) {
        console.error(error)
      } finally {
        if (!ignore) {
          setAiLoading(false)
        }
      }
    }

    fetchAiPrice()
    return () => {
      ignore = true
    }
  }, [product])

useEffect(() => {
  setVariantIndex(0)
  setSelectedColor(product.colors?.[0] ?? null)
  setSelectedImage(0)
  setQuantity(1)
}, [product])

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

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="flex flex-col gap-4">
          <div className="relative bg-muted rounded-2xl overflow-hidden aspect-square">
            <Image
              src={product.images[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <p className="text-white font-semibold text-lg">Hết Hàng</p>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? "border-primary" : "border-border"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} - Ảnh ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
            <h1 className="text-3xl font-bold text-foreground mb-3">{product.name}</h1>
            {product.badges?.length ? (
              <div className="flex flex-wrap gap-2 mb-3">
                {product.badges.map((badge) => (
                  <span key={badge} className="px-3 py-1 rounded-full text-xs bg-muted text-foreground capitalize">
                    {badge}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.rating}/5 từ {Math.floor(Math.random() * 500) + 100} đánh giá)
              </span>
            </div>
            <p className="text-muted-foreground">{product.description}</p>
            {product.highlights?.length ? (
              <ul className="mt-4 text-sm text-muted-foreground space-y-1 list-disc list-inside">
                {product.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Price */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Giá</p>
              <p className="text-4xl font-bold text-primary mb-2">{formattedPrice}</p>
              <p className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-destructive"}`}>
                {product.stock > 0 ? `${product.stock} sản phẩm có sẵn` : "Hết hàng"}
              </p>
              {selectedVariant?.label && (
                <p className="text-xs text-muted-foreground mt-1">Phiên bản: {selectedVariant.label}</p>
              )}
              {selectedColor && <p className="text-xs text-muted-foreground">Màu sắc: {selectedColor}</p>}
            </div>

            {product.variants?.length ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Chọn phiên bản</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, index) => {
                    const active = index === variantIndex
                    return (
                      <button
                        key={variant.label}
                        type="button"
                        onClick={() => setVariantIndex(index)}
                        className={`px-4 py-2 rounded-xl border text-sm flex flex-col items-start ${
                          active ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground"
                        }`}
                      >
                        <span className="font-semibold">{variant.label}</span>
                        <span className="text-xs text-muted-foreground">{formatCurrency(variant.price)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {product.colors?.length ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  Chọn màu sắc
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const active = selectedColor === color
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1 rounded-full border text-xs flex items-center gap-2 ${
                          active ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: stringToColor(color) }}
                        />
                        {color}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>

          {/* Price Estimation */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Sparkles className="w-5 h-5" />
              <p className="text-sm font-semibold">Ước Tính Giá Thị Trường</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {aiLoading
                ? "Đang phân tích..."
                : aiPrice
                  ? formatCurrency(aiPrice.price_vnd)
                  : "Đang tải dữ liệu"}
            </p>
            {aiPrice && (
              <p className={`text-sm ${aiDiff >= 0 ? "text-green-600" : "text-orange-600"} mt-1`}>
                {aiDiff >= 0 ? "Cao hơn" : "Thấp hơn"} giá ước tính: {formatCurrency(Math.abs(aiDiff))}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              Giá ước tính dựa trên thông số kỹ thuật và phân tích thị trường hiện tại.
            </p>
            <Link href="/predict" className="mt-3 inline-flex items-center gap-1 text-primary text-sm font-semibold">
              Tùy chỉnh cấu hình &rarr;
            </Link>
          </div>

          {/* Similar Products Based on Estimated Price */}
          {similarProducts.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">
                  Sản phẩm tương tự trong cửa hàng
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Các sản phẩm có giá tương đương trong khoảng 1-2 triệu VND
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {similarProducts.map((similar) => {
                  const similarPrice = similar.variants?.[0]?.price ?? similar.price
                  const priceDiff = Math.abs(similarPrice - (aiPrice?.price_vnd ?? 0))
                  return (
                    <Link
                      key={similar.id}
                      href={`/product/${similar.slug}`}
                      className="bg-card border border-border rounded-xl p-4 hover:border-primary hover:shadow-lg transition-all group"
                    >
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                        <Image
                          src={similar.images[0] || "/placeholder.svg"}
                          alt={similar.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground truncate">{similar.brand}</p>
                        <h4 className="text-sm font-semibold text-foreground line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                          {similar.name}
                        </h4>
                        <p className="text-base font-bold text-primary">{formatCurrency(similarPrice)}</p>
                        <p className="text-xs text-muted-foreground">
                          Chênh: <span className="font-semibold text-foreground">{formatCurrency(priceDiff)}</span>
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quick Features */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Processor</p>
              <p className="text-sm font-semibold text-foreground">{product.specs.n_cores} Core</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <Battery className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Battery</p>
              <p className="text-sm font-semibold text-foreground">{product.specs.battery_power}mAh</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <Wifi className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">4G</p>
              <p className="text-sm font-semibold text-foreground">{product.specs.four_g ? "Có" : "Không"}</p>
            </div>
          </div>

          {/* Purchase Section */}
          <div className="flex gap-3">
            <div className="flex items-center bg-card border border-border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-foreground hover:bg-muted transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                className="w-12 text-center bg-transparent border-none text-foreground"
                min="1"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-foreground hover:bg-muted transition-colors"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-grow px-6 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                added
                  ? "bg-green-600 text-white"
                  : product.stock === 0
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {added ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
              <Heart className="w-5 h-5" />
              <span className="hidden sm:inline">Yêu thích</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Specifications */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Thông Số Kỹ Thuật Đầy Đủ</h2>
        <SpecsGrid specs={product.specs} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Sản Phẩm Liên Quan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 PhoneHub VN. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
