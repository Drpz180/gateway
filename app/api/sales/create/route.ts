import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, userId, amount, buyerName, buyerEmail, buyerCpf } = body

    // Validar dados obrigatórios
    if (!productId || !userId || !amount || !buyerName || !buyerEmail) {
      return NextResponse.json({ error: "Dados obrigatórios faltando" }, { status: 400 })
    }

    // Verificar se o produto existe
    const product = await sql`
      SELECT id, nome, preco FROM products WHERE id = ${productId}
    `

    if (product.length === 0) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    // Gerar transaction_id único
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Calcular comissão (5% + R$ 2,00)
    const commission = amount * 0.05 + 2.0
    const netAmount = amount - commission

    // Criar a venda
    const sale = await sql`
      INSERT INTO sales (
        product_id, user_id, amount, status, payment_method, 
        transaction_id, buyer_name, buyer_email, buyer_cpf, 
        commission, created_at, updated_at
      ) VALUES (
        ${productId}, ${userId}, ${amount}, 'pending', 'PIX',
        ${transactionId}, ${buyerName}, ${buyerEmail}, ${buyerCpf},
        ${commission}, NOW(), NOW()
      ) RETURNING *
    `

    // Simular pagamento automaticamente
    await sql`
      UPDATE sales 
      SET status = 'paid', updated_at = NOW()
      WHERE transaction_id = ${transactionId}
    `

    // Atualizar saldo do vendedor
    await sql`
      UPDATE users 
      SET 
        saldo_disponivel = COALESCE(saldo_disponivel, 0) + ${netAmount},
        saldo_total_recebido = COALESCE(saldo_total_recebido, 0) + ${netAmount},
        total_sales = COALESCE(total_sales, 0) + 1,
        updated_at = NOW()
      WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      message: "Venda criada e pagamento simulado com sucesso!",
      sale: sale[0],
      transactionId,
      valorBruto: amount,
      taxaTotal: commission,
      valorLiquido: netAmount,
      produto: product[0].nome,
    })
  } catch (error) {
    console.error("Erro ao criar venda:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
