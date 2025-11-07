interface PredictRequest {
  // All input features from CSV (except Launched Price and Launched Year)
  ram_gb: number
  rom_option: string // "32" | "64" | "128" | "256" | "512" | "1TB" | "2TB"
  chip: string
  brand: string // "Apple" | "Samsung" | "Oppo" | "Honor" | "Vivo" | "Other"
  front_camera_mp?: number
  back_camera_mp?: number
  battery_mah?: number
  screen_size_in?: number
  mobile_weight_g?: number // Optional, not used in current model but accepted
}

export interface PredictResponse {
  price_usd: number
  price_vnd: number
  class?: number
  proba?: number[]
}

const MOCK_PROBA = [0.05, 0.15, 0.6, 0.2]

export async function predictPriceRange(specs: PredictRequest): Promise<PredictResponse> {
  // Gọi Next.js API route (proxy tới Python service)
  const apiUrl = "/api/predict"

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 7000) // 7 second timeout

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(specs),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data: PredictResponse = await response.json()
    return data
  } catch (error) {
    console.error("Predict API error:", error)
    // Return mock on error (fallback)
    return {
      price_usd: 699.99,
      price_vnd: 17499750,
      class: 2,
      proba: MOCK_PROBA,
    }
  }
}
