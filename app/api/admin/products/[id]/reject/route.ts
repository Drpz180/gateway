import { type NextRequest, NextResponse } from "next/server"
import productsDb from "@/lib/products-db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    console.log("🔄 Rejeitando produto:", id)

    const product = await productsDb.reject(id)

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Produto não encontrado",
        },
        { status: 404 },
      )
    }

    console.log("✅ Produto rejeitado:", product.id)

    return NextResponse.json({
      success: true,
      data: product,
      message: "Produto rejeitado",
    })
  } catch (error) {
    console.error("❌ Erro ao rejeitar produto:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
