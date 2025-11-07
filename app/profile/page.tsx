"use client"

import Link from "next/link"
import { ChevronLeft, User, Mail, MapPin, Phone, LogOut, Settings } from "lucide-react"

export default function ProfilePage() {
  // Mock user data
  const user = {
    name: "Nguyễn Văn A",
    email: "nguyen.vana@email.com",
    phone: "0912345678",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    joinDate: "Tháng 1, 2024",
  }

  const orders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      total: 26990000,
      status: "Đã Giao",
      items: 1,
    },
    {
      id: "ORD-002",
      date: "2024-01-20",
      total: 38980000,
      status: "Đang Giao",
      items: 2,
    },
  ]

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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 mb-8 text-primary-foreground">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-primary-foreground/80">Thành viên từ {user.joinDate}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Thông Tin Cá Nhân</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-foreground font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Số Điện Thoại</p>
                    <p className="text-foreground font-medium">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Địa Chỉ</p>
                    <p className="text-foreground font-medium">{user.address}</p>
                  </div>
                </div>
              </div>
              <button className="mt-6 px-6 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Chỉnh Sửa
              </button>
            </div>

            {/* Order History */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Lịch Sử Đơn Hàng</h2>
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-grow">
                      <p className="font-medium text-foreground">{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.date} • {order.items} sản phẩm
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                          maximumFractionDigits: 0,
                        }).format(order.total)}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          order.status === "Đã Giao" ? "text-green-600" : "text-blue-600"
                        }`}
                      >
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Account Stats */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h3 className="font-bold text-foreground mb-4">Thống Kê</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">42</p>
                  <p className="text-xs text-muted-foreground">Tổng Đơn Hàng</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">2.5M</p>
                  <p className="text-xs text-muted-foreground">Tổng Tiêu Dùng</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm">
                Chỉnh Sửa Hồ Sơ
              </button>
              <button className="w-full px-4 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors text-sm">
                Đổi Mật Khẩu
              </button>
              <button className="w-full px-4 py-3 border border-destructive/30 text-destructive rounded-lg font-medium hover:bg-destructive/10 transition-colors text-sm flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" />
                Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 PhoneHub VN. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
