import { type NextRequest, NextResponse } from "next/server"
import productsDb from "@/lib/products-db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    console.log("🔄 Aprovando produto:", id)

    const product = await productsDb.approve(id)

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Produto não encontrado",
        },
        { status: 404 },
      )
    }

    console.log("✅ Produto aprovado com sucesso:", product.id)

    return NextResponse.json({
      success: true,
      data: product,
      message: "Produto aprovado com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro ao aprovar produto:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
