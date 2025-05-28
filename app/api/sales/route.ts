import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get("sellerId") || "1"
    const status = searchParams.get("status") // all, paid, pending, cancelled

    console.log("🔍 Buscando vendas para vendedor:", sellerId, "status:", status)

    // Buscar vendas com informações do produto
    let salesQuery = `
      SELECT 
        s.id,
        s.transaction_id,
        s.amount,
        s.status,
        s.payment_method,
        s.buyer_name,
        s.buyer_email,
        s.buyer_cpf,
        s.buyer_phone,
        s.commission,
        s.created_at,
        s.updated_at,
        p.nome as product_name,
        p.id as product_id
      FROM sales s
      LEFT JOIN products p ON s.product_id = p.id
      WHERE s.user_id = $1
    `

    const params = [Number.parseInt(sellerId)]

    // Filtrar por status se especificado
    if (status && status !== "all") {
      if (status === "completed") {
        salesQuery += ` AND s.status = 'paid'`
      } else if (status === "pending") {
        salesQuery += ` AND s.status = 'pending'`
      } else if (status === "cancelled") {
        salesQuery += ` AND s.status = 'cancelled'`
      }
    }

    salesQuery += ` ORDER BY s.created_at DESC LIMIT 100`

    console.log("📝 Query SQL:", salesQuery)
    console.log("📝 Parâmetros:", params)

    const salesResult = await sql.unsafe(salesQuery, params)

    console.log("📊 Resultado da query:", salesResult)
    console.log("📊 Tipo do resultado:", typeof salesResult)
    console.log("📊 É array?", Array.isArray(salesResult))

    // Garantir que salesResult é um array
    const salesArray = Array.isArray(salesResult) ? salesResult : []

    console.log("📊 Sales array length:", salesArray.length)

    // Calcular estatísticas apenas com vendas pagas
    const paidSales = salesArray.filter((sale) => sale.status === "paid")

    const totalSales = salesArray.length
    const totalRevenue = paidSales.reduce((sum, sale) => {
      const amount = Number.parseFloat(sale.amount) || 0
      return sum + amount
    }, 0)

    const totalCommission = paidSales.reduce((sum, sale) => {
      const commission = Number.parseFloat(sale.commission) || 0
      return sum + commission
    }, 0)

    const averageTicket = paidSales.length > 0 ? totalRevenue / paidSales.length : 0

    console.log("📊 Estatísticas calculadas:", {
      totalSales,
      totalRevenue,
      totalCommission,
      averageTicket,
      paidSalesCount: paidSales.length,
    })

    const formattedSales = salesArray.map((sale) => ({
      id: sale.id?.toString() || "",
      transactionId: sale.transaction_id || `TXN-${sale.id}`,
      productName: sale.product_name || "Produto não encontrado",
      productId: sale.product_id?.toString() || "",
      buyerName: sale.buyer_name || "Nome não informado",
      buyerEmail: sale.buyer_email || "",
      buyerCpf: sale.buyer_cpf || "",
      buyerPhone: sale.buyer_phone || "",
      amount: Number.parseFloat(sale.amount) || 0,
      commission: Number.parseFloat(sale.commission) || 0,
      status: sale.status || "pending",
      paymentMethod: sale.payment_method || "pix",
      createdAt: sale.created_at || new Date().toISOString(),
      updatedAt: sale.updated_at || new Date().toISOString(),
    }))

    return NextResponse.json({
      success: true,
      sales: formattedSales,
      stats: {
        totalSales,
        totalRevenue,
        totalCommission,
        averageTicket,
        conversionRate: 3.2, // Placeholder
      },
    })
  } catch (error) {
    console.error("❌ Erro ao buscar vendas:", error)

    // Retornar dados vazios em caso de erro
    return NextResponse.json({
      success: true,
      sales: [],
      stats: {
        totalSales: 0,
        totalRevenue: 0,
        totalCommission: 0,
        averageTicket: 0,
        conversionRate: 0,
      },
      error: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}
