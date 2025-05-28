import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import jwt from "jsonwebtoken"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    const { valor, chavePix, tipo } = await request.json()

    // Validar dados
    if (!valor || !chavePix || valor <= 0) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    // Verificar saldo disponível
    const user = await sql`
      SELECT saldo_disponivel 
      FROM users 
      WHERE id = ${userId}
    `

    if (user.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const saldoDisponivel = Number.parseFloat(user[0].saldo_disponivel || "0")
    if (valor > saldoDisponivel) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 })
    }

    // Criar solicitação de saque
    const saque = await sql`
      INSERT INTO withdraw_requests (
        user_id, 
        valor, 
        tipo, 
        chave_pix, 
        status, 
        created_at
      )
      VALUES (
        ${userId}, 
        ${valor}, 
        ${tipo}, 
        ${chavePix}, 
        'pendente', 
        NOW()
      )
      RETURNING id
    `

    // Atualizar saldo do usuário (reservar o valor)
    await sql`
      UPDATE users 
      SET saldo_disponivel = saldo_disponivel - ${valor}
      WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      saqueId: saque[0].id,
      message: "Solicitação de saque criada com sucesso",
    })
  } catch (error) {
    console.error("Erro ao criar solicitação de saque:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
