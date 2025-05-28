import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== INÍCIO SALVAMENTO CHECKOUT ===")
    console.log("💾 SALVANDO CHECKOUT para produto:", params.id)

    const checkoutData = await request.json()
    const productId = Number.parseInt(params.id)

    // Validar dados obrigatórios
    if (!productId || isNaN(productId)) {
      return NextResponse.json({ message: "ID do produto inválido" }, { status: 400 })
    }

    // Verificar se produto existe
    const productExists = await sql`
      SELECT id FROM products WHERE id = ${productId}
    `

    if (productExists.length === 0) {
      return NextResponse.json({ message: "Produto não encontrado" }, { status: 404 })
    }

    console.log("📝 Dados recebidos:", {
      productId: productId,
      elementos: checkoutData.elements?.length || 0,
      configuracoes: Object.keys(checkoutData.settings || {}).length,
      metodosPagemento: checkoutData.paymentMethods?.length || 0,
    })

    // Verificar se já existe checkout para este produto
    const existingCheckout = await sql`
      SELECT id FROM checkouts WHERE product_id = ${productId}
    `

    let savedCheckout

    if (existingCheckout.length > 0) {
      // Atualizar checkout existente
      console.log("📝 Atualizando checkout existente...")
      const result = await sql`
        UPDATE checkouts 
        SET 
          elements = ${JSON.stringify(checkoutData.elements || [])},
          settings = ${JSON.stringify(checkoutData.settings || {})},
          payment_methods = ${JSON.stringify(checkoutData.paymentMethods || [])},
          updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ${productId}
        RETURNING *
      `
      savedCheckout = result[0]
    } else {
      // Criar novo checkout
      console.log("📝 Criando novo checkout...")
      const result = await sql`
        INSERT INTO checkouts (product_id, user_id, elements, settings, payment_methods)
        VALUES (
          ${productId},
          1,
          ${JSON.stringify(checkoutData.elements || [])},
          ${JSON.stringify(checkoutData.settings || {})},
          ${JSON.stringify(checkoutData.paymentMethods || [])}
        )
        RETURNING *
      `
      savedCheckout = result[0]
    }

    console.log("✅ CHECKOUT SALVO COM SUCESSO:", savedCheckout.id)

    // VERIFICAR PERSISTÊNCIA
    console.log("🔍 Verificando persistência...")
    const verification = await sql`
      SELECT * FROM checkouts WHERE product_id = ${productId}
    `

    if (verification.length === 0) {
      throw new Error("ERRO: Checkout não foi persistido!")
    }

    console.log("✅ PERSISTÊNCIA VERIFICADA!")
    console.log("=== FIM SALVAMENTO CHECKOUT ===")

    return NextResponse.json({
      success: true,
      message: "Checkout salvo com sucesso",
      checkout: {
        id: savedCheckout.id,
        productId: savedCheckout.product_id,
        elements: savedCheckout.elements,
        settings: savedCheckout.settings,
        paymentMethods: savedCheckout.payment_methods,
        createdAt: savedCheckout.created_at,
        updatedAt: savedCheckout.updated_at,
      },
      publicUrl: `https://infoplatform.com/checkout/${productId}`,
    })
  } catch (error) {
    console.error("❌ ERRO CRÍTICO ao salvar checkout:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("📖 CARREGANDO CHECKOUT para produto:", params.id)

    const productId = Number.parseInt(params.id)

    if (!productId || isNaN(productId)) {
      return NextResponse.json({ message: "ID do produto inválido" }, { status: 400 })
    }

    // Buscar checkout salvo
    const savedCheckout = await sql`
      SELECT * FROM checkouts WHERE product_id = ${productId}
    `

    if (savedCheckout.length > 0) {
      const checkout = savedCheckout[0]
      console.log("✅ Checkout encontrado:", checkout.id)

      return NextResponse.json({
        success: true,
        checkout: {
          id: checkout.id,
          productId: checkout.product_id,
          elements: checkout.elements,
          settings: checkout.settings,
          paymentMethods: checkout.payment_methods,
          createdAt: checkout.created_at,
          updatedAt: checkout.updated_at,
        },
      })
    } else {
      console.log("📝 Retornando checkout padrão")
      // Retornar checkout padrão se não existir
      const defaultCheckout = {
        id: "default",
        productId: productId,
        userId: 1,
        elements: [],
        settings: {
          fontFamily: "Inter",
          primaryColor: "#059669",
          secondaryColor: "#64748b",
          activeColor: "#047857",
          iconColor: "#6366f1",
          formBgColor: "#ffffff",
          buttonTextColor: "#ffffff",
          buttonBgColor: "#059669",
          buttonIconColor: "#ffffff",
          selectedButtonBg: "#059669",
          unselectedButtonBg: "#f1f5f9",
        },
        paymentMethods: [
          { id: "pix", name: "PIX", enabled: true },
          { id: "credit_card", name: "Cartão de Crédito", enabled: true },
          { id: "apple_pay", name: "Apple Pay", enabled: true },
          { id: "google_pay", name: "Google Pay", enabled: true },
          { id: "boleto", name: "Boleto", enabled: true },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return NextResponse.json({
        success: true,
        checkout: defaultCheckout,
      })
    }
  } catch (error) {
    console.error("❌ ERRO ao carregar checkout:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
