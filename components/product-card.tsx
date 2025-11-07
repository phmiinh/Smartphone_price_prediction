"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Star, ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/store"
import { useState } from "react"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem)
  const [added, setAdded] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product.id, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const priceRangeLabel = ["Giá Rẻ", "Giá Vừa", "Cao Cấp", "Siêu Cao Cấp"][product.price_range]
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(product.price)

  return (
    <Link href={`/product/${product.slug}`}>
      <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-48 sm:h-56 bg-muted overflow-hidden">
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
            {priceRangeLabel}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.rating})</span>
          </div>

          {/* Specs Preview */}
          <div className="text-xs text-muted-foreground space-y-1 mb-4 flex-grow">
            <p>📱 RAM: {product.specs.ram / 1024}GB</p>
            <p>💾 Bộ Nhớ: {product.specs.int_memory}GB</p>
            <p>🔋 Pin: {product.specs.battery_power}mAh</p>
          </div>

          {/* Price and Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-grow">
              <p className="text-lg font-bold text-primary">{formattedPrice}</p>
            </div>
            <button
              onClick={handleAddToCart}
              className={`p-2 rounded-lg transition-all ${
                added ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
