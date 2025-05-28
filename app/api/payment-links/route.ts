import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Função para gerar UUID simples
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Função corrigida para obter a URL base sem duplo //
function getBaseUrl(request: NextRequest): string {
  // Tenta pegar do environment (sem barra no final)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "") // Remove barra final se existir
  }

  // Pega do header da requisição
  const host = request.headers.get("host")
  const protocol = request.headers.get("x-forwarded-proto") || "https"

  if (host) {
    return `${protocol}://${host}`
  }

  // Fallback para Vercel
  return "https://v0-fork-of-infoprodutos-plataforma-lemon.vercel.app"
}

// POST - Criar link de pagamento único
export async function POST(request: NextRequest) {
  try {
    const { productId, linkType = "checkout" } = await request.json()

    console.log("🔗 Criando link de pagamento para produto:", productId)

    // Verificar se produto existe
    const productCheck = await sql`
      SELECT id, nome, status FROM products WHERE id = ${productId}
    `

    if (productCheck.length === 0) {
      return NextResponse.json({ success: false, error: "Produto não encontrado" }, { status: 404 })
    }

    const product = productCheck[0]

    if (product.status !== "approved") {
      return NextResponse.json({ success: false, error: "Produto precisa estar aprovado" }, { status: 400 })
    }

    // Verificar se já existe link ativo para este produto e tipo
    const existingLink = await sql`
      SELECT uuid FROM payment_links 
      WHERE product_id = ${productId} 
      AND link_type = ${linkType} 
      AND is_active = true
    `

    if (existingLink.length > 0) {
      console.log("✅ Link já existe:", existingLink[0].uuid)
      const baseUrl = getBaseUrl(request)
      return NextResponse.json({
        success: true,
        link: {
          uuid: existingLink[0].uuid,
          url: `${baseUrl}/pay/${existingLink[0].uuid}`, // Sem duplo //
        },
      })
    }

    // Gerar novo UUID
    const uuid = generateUUID()

    // Criar novo link
    const newLink = await sql`
      INSERT INTO payment_links (uuid, product_id, link_type, is_active)
      VALUES (${uuid}, ${productId}, ${linkType}, true)
      RETURNING *
    `

    console.log("✅ Link criado:", uuid)

    const baseUrl = getBaseUrl(request)
    return NextResponse.json({
      success: true,
      link: {
        uuid: uuid,
        url: `${baseUrl}/pay/${uuid}`, // Sem duplo //
      },
    })
  } catch (error) {
    console.error("❌ Erro ao criar link:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}

// GET - Listar links de um produto
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID é obrigatório" }, { status: 400 })
    }

    const links = await sql`
      SELECT pl.*, p.nome as product_name
      FROM payment_links pl
      JOIN products p ON pl.product_id = p.id
      WHERE pl.product_id = ${productId}
      AND pl.is_active = true
      ORDER BY pl.created_at DESC
    `

    const baseUrl = getBaseUrl(request)
    return NextResponse.json({
      success: true,
      links: links.map((link) => ({
        ...link,
        url: `${baseUrl}/pay/${link.uuid}`, // Sem duplo //
      })),
    })
  } catch (error) {
    console.error("❌ Erro ao buscar links:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
