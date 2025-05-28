import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = Number.parseInt(searchParams.get("sellerId") || "1")
    const period = Number.parseInt(searchParams.get("period") || "7")

    console.log("🚀 Fetching stats for seller:", sellerId, "period:", period)

    // Query 1: Vendas de hoje
    const todayResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM sales 
      WHERE user_id = ${sellerId} 
      AND status = 'paid'
      AND DATE(created_at) = CURRENT_DATE
    `

    // Query 2: Vendas do mês
    const monthResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM sales 
      WHERE user_id = ${sellerId} 
      AND status = 'paid'
      AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    `

    // Query 3: Saldo do usuário
    const balanceResult = await sql`
      SELECT COALESCE(saldo_disponivel, 0) as balance
      FROM users 
      WHERE id = ${sellerId}
    `

    // Query 4: Dados do gráfico baseado no período
    let salesDataResult
    if (period === 7) {
      salesDataResult = await sql`
        SELECT 
          DATE(created_at) as date,
          COALESCE(SUM(amount), 0) as amount
        FROM sales 
        WHERE user_id = ${sellerId} 
        AND status = 'paid'
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `
    } else if (period === 15) {
      salesDataResult = await sql`
        SELECT 
          DATE(created_at) as date,
          COALESCE(SUM(amount), 0) as amount
        FROM sales 
        WHERE user_id = ${sellerId} 
        AND status = 'paid'
        AND created_at >= CURRENT_DATE - INTERVAL '15 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `
    } else {
      salesDataResult = await sql`
        SELECT 
          DATE(created_at) as date,
          COALESCE(SUM(amount), 0) as amount
        FROM sales 
        WHERE user_id = ${sellerId} 
        AND status = 'paid'
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `
    }

    // Query 5: Stats PIX do mês
    const pixResult = await sql`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as amount
      FROM sales 
      WHERE user_id = ${sellerId} 
      AND status = 'paid'
      AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
    `

    // Processar resultados
    const todaySales = Number(todayResult[0]?.total || 0)
    const monthSales = Number(monthResult[0]?.total || 0)
    const availableBalance = Number(balanceResult[0]?.balance || 0)

    const salesData = salesDataResult.map((row) => ({
      date: row.date,
      amount: Number(row.amount) || 0,
    }))

    const pixStats = {
      method: "PIX",
      amount: Number(pixResult[0]?.amount || 0),
      count: Number(pixResult[0]?.count || 0),
    }

    const response = {
      todaySales,
      monthSales,
      availableBalance,
      salesData,
      paymentMethods: [pixStats],
      totalProducts: 0,
      totalSales: pixStats.count,
    }

    console.log("✅ Stats fetched successfully:", {
      todaySales,
      monthSales,
      salesDataLength: salesData.length,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Erro ao buscar estatísticas:", error)

    // Retornar dados vazios em caso de erro
    return NextResponse.json({
      todaySales: 0,
      monthSales: 0,
      availableBalance: 0,
      salesData: [],
      paymentMethods: [{ method: "PIX", amount: 0, count: 0 }],
      totalProducts: 0,
      totalSales: 0,
      error: error.message,
    })
  }
}
