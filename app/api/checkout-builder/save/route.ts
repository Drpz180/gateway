import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "Token não fornecido" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any
    const checkoutData = await request.json()

    // In production, save to database
    const checkoutId = Date.now().toString()
    const publicUrl = `https://infoplatform.com/checkout/${checkoutId}`

    // Mock save to database
    console.log("Saving checkout:", {
      id: checkoutId,
      elements: checkoutData.elements,
      settings: checkoutData.settings,
      bannerImage: checkoutData.bannerImage ? "uploaded" : "none",
      timestamp: checkoutData.timestamp,
    })

    // TODO: Save checkout configuration to database
    // TODO: Save banner image to storage (S3 or local)
    // TODO: Generate static HTML file or save configuration for dynamic rendering

    return NextResponse.json({
      message: "Checkout salvo com sucesso",
      checkoutId,
      publicUrl,
    })
  } catch (error) {
    console.error("Checkout save error:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
