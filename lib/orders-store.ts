import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Order, OrderItem, PaymentMethod, ShippingInfo } from "./types"

interface CreateOrderPayload {
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  discount?: number
  paymentMethod: PaymentMethod
  shipping: ShippingInfo
  note?: string
  eta?: string
}

interface OrderStore {
  orders: Order[]
  createOrder: (payload: CreateOrderPayload) => Order
  getOrderById: (id: string) => Order | undefined
  updateStatus: (id: string, status: Order["status"]) => void
}

function generateOrderId() {
  const timestamp = new Date()
  const datePart = timestamp.toISOString().split("T")[0].replace(/-/g, "")
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${datePart}-${random}`
}

export const useOrders = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      createOrder: (payload) => {
        const order: Order = {
          id: generateOrderId(),
          status: "processing",
          items: payload.items,
          subtotal: payload.subtotal,
          total: payload.subtotal + payload.shippingFee - (payload.discount ?? 0),
          shippingFee: payload.shippingFee,
          discount: payload.discount,
          paymentMethod: payload.paymentMethod,
          shipping: payload.shipping,
          note: payload.note,
          createdAt: new Date().toISOString(),
          eta:
            payload.eta ??
            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // default +3 days
        }

        set((state) => ({
          orders: [order, ...state.orders],
        }))

        return order
      },
      getOrderById: (id) => get().orders.find((order) => order.id === id),
      updateStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((order) => (order.id === id ? { ...order, status } : order)),
        })),
    }),
    {
      name: "orders-store",
    },
  ),
)

