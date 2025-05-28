import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("📖 Carregando configurações do produto:", params.id)

    // Verificar se o produto existe
    const checkProduct = await sql`
      SELECT id FROM products WHERE id = ${params.id}
    `

    if (checkProduct.length === 0) {
      return NextResponse.json({ message: "Produto não encontrado" }, { status: 404 })
    }

    // Buscar configurações salvas
    const result = await sql`
      SELECT * FROM product_settings WHERE product_id = ${params.id}
    `

    if (result.length > 0) {
      const settings = result[0]
      console.log("✅ Configurações encontradas")

      return NextResponse.json({
        settings: {
          productId: settings.product_id,
          paymentMethods:
            typeof settings.payment_methods === "string"
              ? JSON.parse(settings.payment_methods)
              : settings.payment_methods,
          trackingSettings:
            typeof settings.tracking_settings === "string"
              ? JSON.parse(settings.tracking_settings)
              : settings.tracking_settings,
          orderBumps:
            typeof settings.order_bumps === "string" ? JSON.parse(settings.order_bumps) : settings.order_bumps,
          upsells: typeof settings.upsells === "string" ? JSON.parse(settings.upsells) : settings.upsells,
          checkoutSettings:
            typeof settings.checkout_settings === "string"
              ? JSON.parse(settings.checkout_settings)
              : settings.checkout_settings,
        },
      })
    } else {
      console.log("📝 Retornando configurações padrão")
      // Configurações padrão
      const defaultSettings = {
        productId: params.id,
        paymentMethods: [
          { id: "pix", name: "PIX", enabled: true },
          { id: "credit_card", name: "Cartão de Crédito", enabled: true },
          { id: "apple_pay", name: "Apple Pay", enabled: false },
          { id: "google_pay", name: "Google Pay", enabled: false },
        ],
        trackingSettings: {
          facebookPixel: "",
          googleAdsId: "",
          googleAnalytics: "",
          enableTracking: true,
        },
        orderBumps: [],
        upsells: [],
        checkoutSettings: {
          enableOrderBumps: true,
          enableUpsells: true,
          enableAbandonedCart: true,
          abandonedCartDelay: 30,
          enableExitIntent: true,
        },
      }

      return NextResponse.json({
        settings: defaultSettings,
      })
    }
  } catch (error) {
    console.error("❌ Erro ao carregar configurações:", error)
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== SALVANDO CONFIGURAÇÕES DO PRODUTO ===")
    console.log("📝 Produto ID:", params.id)

    const settingsData = await request.json()
    console.log("📦 Dados recebidos:", settingsData)

    // Verificar se o produto existe
    const checkProduct = await sql`
      SELECT id FROM products WHERE id = ${params.id}
    `

    if (checkProduct.length === 0) {
      return NextResponse.json({ message: "Produto não encontrado" }, { status: 404 })
    }

    // Salvar ou atualizar configurações
    const result = await sql`
      INSERT INTO product_settings (
        product_id, 
        payment_methods, 
        tracking_settings, 
        order_bumps, 
        upsells, 
        checkout_settings,
        updated_at
      ) VALUES (
        ${params.id},
        ${JSON.stringify(settingsData.paymentMethods || [])},
        ${JSON.stringify(settingsData.trackingSettings || {})},
        ${JSON.stringify(settingsData.orderBumps || [])},
        ${JSON.stringify(settingsData.upsells || [])},
        ${JSON.stringify(settingsData.checkoutSettings || {})},
        NOW()
      )
      ON CONFLICT (product_id) 
      DO UPDATE SET
        payment_methods = ${JSON.stringify(settingsData.paymentMethods || [])},
        tracking_settings = ${JSON.stringify(settingsData.trackingSettings || {})},
        order_bumps = ${JSON.stringify(settingsData.orderBumps || [])},
        upsells = ${JSON.stringify(settingsData.upsells || [])},
        checkout_settings = ${JSON.stringify(settingsData.checkoutSettings || {})},
        updated_at = NOW()
      RETURNING *
    `

    console.log("✅ Configurações salvas com sucesso!")

    return NextResponse.json({
      message: "Configurações salvas com sucesso",
      settings: result[0],
    })
  } catch (error) {
    console.error("❌ Erro ao salvar configurações:", error)
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
