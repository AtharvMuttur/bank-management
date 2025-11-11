import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ custId: string }> }) {
  try {
    const { custId } = await params
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

    console.log("[v0] Fetching total balance for customer:", custId)

    const response = await fetch(`${backendUrl}/api/customer-balance/${custId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("[v0] Backend error:", response.status, response.statusText)
      return NextResponse.json({ error: "Failed to fetch customer balance" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching customer balance:", error)
    return NextResponse.json({ error: "Failed to fetch customer balance" }, { status: 500 })
  }
}
