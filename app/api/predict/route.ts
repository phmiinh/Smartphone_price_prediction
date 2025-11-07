import { NextRequest, NextResponse } from "next/server"

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

interface PredictResponse {
  price_usd: number
  price_vnd: number
  class?: number
  proba?: number[]
}

const MOCK_RESPONSE: PredictResponse = {
  price_usd: 699.99,
  price_vnd: 17499750,
  class: 2,
  proba: [0.05, 0.15, 0.6, 0.2],
}

export async function POST(request: NextRequest) {
  try {
    const body: PredictRequest = await request.json()

    // Lấy API URL từ environment (fallback to localhost nếu chưa set)
    const apiUrl = process.env.PREDICT_API_URL || "http://localhost:8000/predict"

    // Timeout 7 giây như yêu cầu
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 7000)

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data: PredictResponse = await response.json()

      // Validate response format - chỉ cần price_usd và price_vnd
      if (
        typeof data.price_usd !== "number" ||
        typeof data.price_vnd !== "number"
      ) {
        throw new Error("Invalid response format from model API")
      }

      return NextResponse.json(data)
    } catch (error) {
      clearTimeout(timeout)

      // Nếu API không available hoặc timeout, trả về mock
      console.error("Predict API error:", error)

      // Chỉ trả về mock nếu là network error hoặc timeout
      if (error instanceof Error && error.name === "AbortError") {
        console.warn("API timeout, returning mock response")
        return NextResponse.json(MOCK_RESPONSE)
      }

      // Nếu có PREDICT_API_URL nhưng lỗi → trả về mock
      if (process.env.PREDICT_API_URL) {
        console.warn("API unavailable, returning mock response")
        return NextResponse.json(MOCK_RESPONSE)
      }

      // Nếu chưa có PREDICT_API_URL → luôn trả về mock
      return NextResponse.json(MOCK_RESPONSE)
    }
  } catch (error) {
    console.error("Request parsing error:", error)
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}


