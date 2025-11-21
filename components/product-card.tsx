"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Star, ShoppingCart, Cpu } from "lucide-react"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/store"
import { useState } from "react"
import { formatCurrency } from "@/lib/utils"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem)
  const [added, setAdded] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product.id, 1, { unitPrice: product.price })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const priceRangeLabel = ["Giá Rẻ", "Giá Vừa", "Cao Cấp", "Siêu Cao Cấp"][product.price_range]
  const formattedPrice = formatCurrency(product.price)

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
          <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
              {priceRangeLabel}
            </span>
            {product.badges?.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className="bg-card/80 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-semibold text-foreground border border-border"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
            <span>{product.brand}</span>
            {product.category && <span className="capitalize px-2 py-0.5 rounded-full bg-muted">{product.category}</span>}
          </div>
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[3rem]">
            {product.name}
          </h3>
          {product.chipset && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span className="line-clamp-1">{product.chipset}</span>
            </div>
          )}

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
            <p>💾 Bộ nhớ: {product.specs.int_memory}GB</p>
            <p>🔋 Pin: {product.specs.battery_power}mAh</p>
            {product.highlights?.length ? <p>✨ {product.highlights[0]}</p> : null}
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
