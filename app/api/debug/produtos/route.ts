import { NextResponse } from "next/server"
import { productsDB } from "@/lib/products-db"

export async function GET() {
  try {
    const status = productsDB.getStatus()
    const products = productsDB.findAll()

    return NextResponse.json({
      success: true,
      status,
      products: products.map((p) => ({
        id: p.id,
        nome: p.nome,
        preco: p.preco,
        logo_url: p.logo_url,
        url_checkout: p.url_checkout,
        created_at: p.created_at,
      })),
    })
  } catch (error) {
    console.error("❌ Erro no debug:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}
