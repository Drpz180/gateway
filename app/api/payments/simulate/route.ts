import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { txid } = await request.json()

    if (!txid) {
      return NextResponse.json({ message: "TXID é obrigatório" }, { status: 400 })
    }

    console.log("🧪 Simulando pagamento para TXID:", txid)

    // Buscar a venda pendente
    const saleResult = await sql`
      SELECT s.*, p.nome as product_name, u.name as seller_name
      FROM sales s
      JOIN products p ON s.product_id = p.id
      JOIN users u ON s.user_id = u.id
      WHERE s.transaction_id = ${txid} AND s.status = 'pending'
    `

    if (saleResult.length === 0) {
      return NextResponse.json(
        {
          message: "Transação não encontrada ou já processada",
        },
        { status: 404 },
      )
    }

    const sale = saleResult[0]

    // Calcular valores (taxa de 5% + R$ 2,00 fixo)
    const valorBruto = Number(sale.amount)
    const taxaPercentual = 5.0
    const taxaFixa = 2.0
    const taxaTotal = (valorBruto * taxaPercentual) / 100 + taxaFixa
    const valorLiquido = valorBruto - taxaTotal

    console.log("💰 Calculando valores:", {
      bruto: valorBruto,
      taxa: taxaTotal,
      liquido: valorLiquido,
    })

    // Atualizar status da venda
    await sql`
      UPDATE sales 
      SET status = 'paid', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${sale.id}
    `

    // Adicionar ao histórico de saldo
    await sql`
      INSERT INTO balance_history (
        user_id, 
        sale_id, 
        amount_gross, 
        fee_percentage, 
        fee_fixed, 
        amount_net, 
        type
      ) VALUES (
        ${sale.user_id},
        ${sale.id},
        ${valorBruto},
        ${taxaPercentual},
        ${taxaFixa},
        ${valorLiquido},
        'sale'
      )
    `

    // Atualizar saldo do usuário
    await sql`
      UPDATE users 
      SET 
        saldo_disponivel = saldo_disponivel + ${valorLiquido},
        saldo_total_recebido = saldo_total_recebido + ${valorBruto},
        total_sales = total_sales + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${sale.user_id}
    `

    // Atualizar estatísticas do produto
    await sql`
      UPDATE products 
      SET 
        sales = sales + 1,
        revenue = revenue + ${valorBruto},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${sale.product_id}
    `

    console.log("✅ Pagamento simulado com sucesso!")

    return NextResponse.json({
      success: true,
      message: "Pagamento simulado com sucesso!",
      txid,
      valorBruto,
      taxaTotal,
      valorLiquido,
      vendedor: sale.seller_name,
      produto: sale.product_name,
    })
  } catch (error) {
    console.error("❌ Erro ao simular pagamento:", error)
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
