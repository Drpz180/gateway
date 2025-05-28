import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Simulação de dados reais baseados nos produtos criados
const salesData = [
  { date: "2024-01-01", sales: 12, revenue: 2364 },
  { date: "2024-01-02", sales: 8, revenue: 1576 },
  { date: "2024-01-03", sales: 15, revenue: 2955 },
  { date: "2024-01-04", sales: 22, revenue: 4334 },
  { date: "2024-01-05", sales: 18, revenue: 3546 },
  { date: "2024-01-06", sales: 25, revenue: 4925 },
  { date: "2024-01-07", sales: 30, revenue: 5910 },
]

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "Token não fornecido" }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    } catch (error) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 })
    }

    // Calcular métricas reais baseadas nos dados
    const totalSales = salesData.reduce((sum, day) => sum + day.sales, 0)
    const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0)
    const averageTicket = totalRevenue / totalSales || 0

    // Simular crescimento baseado nos últimos 7 dias vs 7 dias anteriores
    const last7Days = salesData.slice(-7)
    const previous7Days = salesData.slice(-14, -7)

    const last7DaysSales = last7Days.reduce((sum, day) => sum + day.sales, 0)
    const previous7DaysSales = previous7Days.reduce((sum, day) => sum + day.sales, 0)

    const salesGrowth = previous7DaysSales > 0 ? ((last7DaysSales - previous7DaysSales) / previous7DaysSales) * 100 : 0

    const last7DaysRevenue = last7Days.reduce((sum, day) => sum + day.revenue, 0)
    const previous7DaysRevenue = previous7Days.reduce((sum, day) => sum + day.revenue, 0)

    const revenueGrowth =
      previous7DaysRevenue > 0 ? ((last7DaysRevenue - previous7DaysRevenue) / previous7DaysRevenue) * 100 : 0

    // Dados reais da dashboard
    const dashboardStats = {
      totalSales,
      totalRevenue,
      activeAffiliates: Math.floor(totalSales * 0.3), // 30% dos clientes viram afiliados
      conversionRate: 3.2, // Taxa de conversão realista
      salesGrowth: Math.round(salesGrowth * 100) / 100,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      affiliateGrowth: 8.5,
      conversionGrowth: 0.8,
      salesChart: salesData,
      topProducts: [
        {
          name: "Curso de Marketing Digital",
          sales: Math.floor(totalSales * 0.4),
          revenue: Math.floor(totalRevenue * 0.4),
        },
        {
          name: "E-book de Vendas",
          sales: Math.floor(totalSales * 0.3),
          revenue: Math.floor(totalRevenue * 0.3),
        },
        {
          name: "Mentoria Individual",
          sales: Math.floor(totalSales * 0.2),
          revenue: Math.floor(totalRevenue * 0.2),
        },
        {
          name: "Workshop Online",
          sales: Math.floor(totalSales * 0.1),
          revenue: Math.floor(totalRevenue * 0.1),
        },
      ],
      recentSales: [
        {
          customer: "João Silva",
          product: "Curso de Marketing Digital",
          amount: 197,
          date: "2024-01-07T10:30:00Z",
        },
        {
          customer: "Maria Santos",
          product: "E-book de Vendas",
          amount: 47,
          date: "2024-01-07T09:15:00Z",
        },
        {
          customer: "Pedro Costa",
          product: "Mentoria Individual",
          amount: 497,
          date: "2024-01-07T08:45:00Z",
        },
        {
          customer: "Ana Oliveira",
          product: "Workshop Online",
          amount: 97,
          date: "2024-01-06T16:20:00Z",
        },
        {
          customer: "Carlos Ferreira",
          product: "Curso de Marketing Digital",
          amount: 197,
          date: "2024-01-06T14:10:00Z",
        },
      ],
    }

    return NextResponse.json(dashboardStats)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
