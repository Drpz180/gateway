export const runtime = "nodejs" // ✅ Garante que rode em ambiente Node.js

import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(
  request: NextRequest,
  context: { params: { uuid: string } }
) {
  try {
    const { uuid } = context.params
    const body = await request.json().catch(() => ({}))
    const { type = "click", paymentMethod } = body

    console.log(`📊 Registrando ${type} para UUID:`, uuid)

    if (type === "click") {
      await sql`
        UPDATE payment_links 
        SET clicks = clicks + 1, updated_at = CURRENT_TIMESTAMP
        WHERE uuid = ${uuid}
      `
    } else if (type === "conversion") {
      await sql`
        UPDATE payment_links 
        SET conversions = conversions + 1, updated_at = CURRENT_TIMESTAMP
        WHERE uuid = ${uuid}
      `

      const linkResult = await sql`
        SELECT product_id FROM payment_links WHERE uuid = ${uuid}
      `

      if (linkResult.length > 0) {
        await sql`
          UPDATE products 
          SET sales = sales + 1, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${linkResult[0].product_id}
        `
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Erro ao registrar tracking:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
