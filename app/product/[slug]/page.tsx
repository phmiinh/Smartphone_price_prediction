"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Heart, Share2, Star, ShoppingCart, Zap, Battery, Wifi } from "lucide-react"
import { getProductBySlug, getRelatedProducts } from "@/lib/products-db"
import { useCart } from "@/lib/store"
import ProductCard from "@/components/product-card"
import SpecsGrid from "@/components/specs-grid"

interface ProductDetailProps {
  params: {
    slug: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailProps) {
  const product = getProductBySlug(params.slug)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)
  const addItem = useCart((state) => state.addItem)

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
    addItem(product.id, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const relatedProducts = getRelatedProducts(params.slug)
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(product.price)

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
          </div>

          {/* Price */}
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-2">Giá</p>
            <p className="text-4xl font-bold text-primary mb-2">{formattedPrice}</p>
            <p className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-destructive"}`}>
              {product.stock > 0 ? `${product.stock} sản phẩm có sẵn` : "Hết hàng"}
            </p>
          </div>

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
