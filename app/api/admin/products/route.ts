import { NextResponse } from "next/server"
import productsDb from "@/lib/products-db"

export async function GET() {
  try {
    console.log("🔄 Admin carregando todos os produtos...")

    const products = await productsDb.getAll()

    console.log("✅ Produtos carregados para admin:", products.length)
    console.log(
      "📊 Status dos produtos:",
      products.map((p) => ({ id: p.id, nome: p.nome, status: p.status })),
    )

    return NextResponse.json({
      success: true,
      products: products,
      total: products.length,
    })
  } catch (error) {
    console.error("❌ Erro ao carregar produtos para admin:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        message: "Erro ao carregar produtos",
      },
      { status: 500 },
    )
  }
}
