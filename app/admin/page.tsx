"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Plus, Edit2, Trash2, Search } from "lucide-react"
import { getAllProducts, updateProduct, createProduct } from "@/lib/products-db"
import type { Product } from "@/lib/types"
import AdminProductModal from "@/components/admin-product-modal"

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const allProducts = getAllProducts()
    setProducts(allProducts)
    setFilteredProducts(allProducts)
  }, [])

  useEffect(() => {
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProducts(filtered)
  }, [searchTerm, products])

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowModal(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      updateProduct(product.id, product)
      setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)))
    } else {
      createProduct(product)
      setProducts((prev) => [...prev, product])
    }
    setShowModal(false)
  }

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price)

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Quay lại</span>
          </Link>
          <h1 className="text-xl font-bold text-foreground hidden sm:block">Quản Lý Sản Phẩm</h1>
          <div className="w-0" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={handleAddProduct}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Thêm Sản Phẩm
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Tổng Sản Phẩm</p>
            <p className="text-2xl font-bold text-primary">{products.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Hàng Có Sẵn</p>
            <p className="text-2xl font-bold text-primary">{products.reduce((sum, p) => sum + p.stock, 0)}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Tổng Giá Trị</p>
            <p className="text-lg font-bold text-primary">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
                products.reduce((sum, p) => sum + p.price * p.stock, 0),
              )}
            </p>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Sản Phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Thương Hiệu</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Giá</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Hàng Có Sẵn</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Đánh Giá</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{product.brand}</td>
                    <td className="px-6 py-4 font-semibold text-primary text-sm">{formattedPrice(product.price)}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">⭐ {product.rating}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Không tìm thấy sản phẩm</p>
            <button
              onClick={handleAddProduct}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm Sản Phẩm Đầu Tiên
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AdminProductModal product={editingProduct} onSave={handleSaveProduct} onClose={() => setShowModal(false)} />
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
