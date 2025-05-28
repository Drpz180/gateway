import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import jwt from "jsonwebtoken"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    // Buscar dados do usuário
    const user = await sql`
      SELECT saldo_disponivel, saldo_total_recebido 
      FROM users 
      WHERE id = ${userId}
    `

    if (user.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar vendas do usuário
    const vendas = await sql`
      SELECT 
        c.id,
        p.name as produto,
        c.valor,
        c.valor_liquido,
        c.status,
        c.created_at as data,
        c.comprador_nome as comprador
      FROM cobrancas c
      JOIN products p ON c.produto_id = p.id
      WHERE p.user_id = ${userId}
      ORDER BY c.created_at DESC
      LIMIT 50
    `

    // Buscar saques do usuário
    const saques = await sql`
      SELECT 
        id,
        valor,
        chave_pix,
        status,
        created_at as data,
        observacao
      FROM withdraw_requests
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `

    // Calcular estatísticas do mês atual
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    const estatisticasMes = await sql`
      SELECT 
        COUNT(*) as vendas_mes,
        COALESCE(SUM(valor_liquido), 0) as receita_mes,
        COALESCE(SUM(valor - valor_liquido), 0) as taxas_mes
      FROM cobrancas c
      JOIN products p ON c.produto_id = p.id
      WHERE p.user_id = ${userId}
        AND c.status = 'pago'
        AND c.created_at >= ${inicioMes.toISOString()}
    `

    // Calcular crescimento (comparar com mês anterior)
    const inicioMesAnterior = new Date(inicioMes)
    inicioMesAnterior.setMonth(inicioMesAnterior.getMonth() - 1)

    const estatisticasMesAnterior = await sql`
      SELECT COUNT(*) as vendas_mes_anterior
      FROM cobrancas c
      JOIN products p ON c.produto_id = p.id
      WHERE p.user_id = ${userId}
        AND c.status = 'pago'
        AND c.created_at >= ${inicioMesAnterior.toISOString()}
        AND c.created_at < ${inicioMes.toISOString()}
    `

    const vendasMes = Number.parseInt(estatisticasMes[0]?.vendas_mes || "0")
    const vendasMesAnterior = Number.parseInt(estatisticasMesAnterior[0]?.vendas_mes_anterior || "0")
    const crescimento = vendasMesAnterior > 0 ? ((vendasMes - vendasMesAnterior) / vendasMesAnterior) * 100 : 0

    const financialData = {
      saldoDisponivel: Number.parseFloat(user[0].saldo_disponivel || "0"),
      saldoTotal: Number.parseFloat(user[0].saldo_total_recebido || "0"),
      vendas: vendas.map((venda) => ({
        id: venda.id,
        produto: venda.produto,
        valor: Number.parseFloat(venda.valor),
        valorLiquido: Number.parseFloat(venda.valor_liquido || venda.valor),
        status: venda.status,
        data: venda.data,
        comprador: venda.comprador,
      })),
      saques: saques.map((saque) => ({
        id: saque.id,
        valor: Number.parseFloat(saque.valor),
        chavePix: saque.chave_pix,
        status: saque.status,
        data: saque.data,
        observacao: saque.observacao,
      })),
      estatisticas: {
        vendasMes,
        receitaMes: Number.parseFloat(estatisticasMes[0]?.receita_mes || "0"),
        taxasMes: Number.parseFloat(estatisticasMes[0]?.taxas_mes || "0"),
        crescimento: Math.round(crescimento),
      },
    }

    return NextResponse.json(financialData)
  } catch (error) {
    console.error("Erro ao buscar dados financeiros:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
