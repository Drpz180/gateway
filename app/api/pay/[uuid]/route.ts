
import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { uuid: string } }) {
  try {
    console.log("🔍 Buscando produto para UUID:", params.uuid)

    // Buscar o link de pagamento
    const linkResult = await sql`
      SELECT pl.*, p.*, u.name as creator_name
      FROM payment_links pl
      JOIN products p ON pl.product_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE pl.uuid = ${params.uuid} AND pl.is_active = true
    `

    if (linkResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Link de pagamento não encontrado ou inativo",
        },
        { status: 404 },
      )
    }

    const link = linkResult[0]

    // Verificar se o produto está aprovado
    if (link.status !== "approved") {
      return NextResponse.json(
        {
          success: false,
          error: "Produto não está disponível para venda",
        },
        { status: 400 },
      )
    }

    // Buscar configurações do checkout
    const checkoutResult = await sql`
      SELECT * FROM checkouts 
      WHERE product_id = ${link.product_id}
      ORDER BY created_at DESC 
      LIMIT 1
    `

    // Configurações padrão do checkout se não existir
    const defaultCheckout = {
      settings: {
        fontFamily: "Inter",
        buttonBgColor: "#059669",
        buttonTextColor: "#ffffff",
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
      },
      elements: [
        {
          id: "header-1",
          type: "header",
          content: {
            title: link.nome,
            subtitle: "Transforme sua vida hoje mesmo!",
            titleColor: "#1f2937",
            subtitleColor: "#6b7280",
          },
        },
      ],
    }

    const checkout = checkoutResult.length > 0 ? checkoutResult[0] : defaultCheckout

    // Configurações de métodos de pagamento padrão
    const defaultPaymentMethods = [
      { id: "pix", name: "PIX", enabled: true },
      { id: "credit_card", name: "Cartão de Crédito", enabled: true },
      { id: "apple_pay", name: "Apple Pay", enabled: false },
      { id: "google_pay", name: "Google Pay", enabled: false },
    ]

    const productSettings = {
      paymentMethods: defaultPaymentMethods,
    }

    // Preparar dados do produto
    const product = {
      id: link.product_id,
      nome: link.nome,
      descricao: link.descricao,
      preco: link.preco,
      logo_url: link.logo_url,
      creator: link.creator_name || "Vendedor",
      status: link.status,
    }

    console.log("✅ Produto encontrado:", product.nome)

    return NextResponse.json({
      success: true,
      product,
      checkout,
      productSettings,
      link: {
        uuid: link.uuid,
        clicks: link.clicks,
        conversions: link.conversions,
      },
    })
  } catch (error) {
    console.error("❌ Erro ao buscar produto:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
