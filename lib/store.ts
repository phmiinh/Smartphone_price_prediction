import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem } from "./types"

type CartSelection = {
  variantLabel?: string
  color?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (productId: string, quantity: number, options?: CartSelection & { unitPrice?: number }) => void
  removeItem: (productId: string, selection?: CartSelection) => void
  updateQuantity: (productId: string, quantity: number, selection?: CartSelection) => void
  clearCart: () => void
  getTotalItems: () => number
}

const isSameSelection = (item: CartItem, productId: string, selection?: CartSelection) =>
  item.productId === productId &&
  item.variantLabel === selection?.variantLabel &&
  item.color === selection?.color

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId, quantity, options) =>
        set((state) => {
          const existing = state.items.find((item) => isSameSelection(item, productId, options))
          if (existing) {
            return {
              items: state.items.map((item) =>
                isSameSelection(item, productId, options)
                  ? { ...item, quantity: item.quantity + quantity, unitPrice: options?.unitPrice ?? item.unitPrice }
                  : item,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                productId,
                quantity,
                variantLabel: options?.variantLabel,
                color: options?.color,
                unitPrice: options?.unitPrice,
              },
            ],
          }
        }),
      removeItem: (productId, selection) =>
        set((state) => ({
          items: state.items.filter((item) => !isSameSelection(item, productId, selection)),
        })),
      updateQuantity: (productId, quantity, selection) =>
        set((state) => ({
          items: state.items.map((item) =>
            isSameSelection(item, productId, selection) ? { ...item, quantity } : item,
          ),
        })),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: "cart-store",
    },
  ),
)
