import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🗑️ Deletando produto:", params.id)

    // Verificar se o produto existe
    const existingProduct = await sql`
      SELECT id FROM products WHERE id = ${params.id}
    `

    if (existingProduct.length === 0) {
      return NextResponse.json({ success: false, error: "Produto não encontrado" }, { status: 404 })
    }

    // Deletar o produto
    await sql`
      DELETE FROM products WHERE id = ${params.id}
    `

    console.log("✅ Produto deletado com sucesso")

    return NextResponse.json({
      success: true,
      message: "Produto deletado com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro ao deletar produto:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
