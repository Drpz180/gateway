import { type NextRequest, NextResponse } from "next/server"
import { CobrancaDB, UserDB, SaldoDB, FinancialSettingsDB } from "@/lib/database"
import { validateWebhook, processWebhookPayload } from "@/lib/efibank"

export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Webhook EfiBank recebido")

    const signature = request.headers.get("x-efibank-signature") || ""
    const body = await request.text()

    // Validar assinatura do webhook (em produção)
    if (!validateWebhook(signature, body)) {
      console.log("❌ Assinatura do webhook inválida")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const payload = JSON.parse(body)
    console.log("📨 Payload do webhook:", payload)

    // Processar dados do webhook
    const { txid, status, amount } = processWebhookPayload(payload)

    console.log("🔍 Processando:", { txid, status, amount })

    // Buscar cobrança no banco
    const cobranca = CobrancaDB.findByTxid(txid)

    if (!cobranca) {
      console.log("❌ Cobrança não encontrada:", txid)
      return NextResponse.json({ message: "Cobrança não encontrada" }, { status: 404 })
    }

    // Evitar processamento duplicado
    if (cobranca.status === status) {
      console.log("⚠️ Status já processado:", txid, status)
      return NextResponse.json({ message: "Já processado" })
    }

    // Atualizar status da cobrança
    CobrancaDB.updateStatus(txid, status)

    if (status === "paid") {
      console.log("💰 Pagamento confirmado:", txid)

      // Obter configurações financeiras
      const financialSettings = FinancialSettingsDB.get()

      // Calcular valores
      const valorBruto = cobranca.amount
      const taxaRetencao = (valorBruto * financialSettings.taxaRetencaoVenda) / 100
      const taxaFixa = financialSettings.taxaFixaVenda
      const valorLiquido = valorBruto - taxaRetencao - taxaFixa

      console.log("💵 Cálculo financeiro:", {
        valorBruto,
        taxaRetencao,
        taxaFixa,
        valorLiquido,
      })

      // Adicionar saldo ao vendedor
      const vendedor = UserDB.addSaldo(cobranca.sellerId, valorLiquido)

      if (vendedor) {
        console.log(`✅ Saldo adicionado: ${vendedor.name} +R$ ${valorLiquido.toFixed(2)}`)

        // Registrar entrada no histórico de saldos
        SaldoDB.create({
          userId: cobranca.sellerId,
          cobrancaId: cobranca.id,
          entrada: valorBruto,
          taxaRetencao,
          taxaFixa,
          valorFinal: valorLiquido,
        })

        // TODO: Enviar email de confirmação para comprador
        // await sendPurchaseConfirmationEmail(cobranca.buyerEmail, cobranca)

        // TODO: Enviar notificação para vendedor
        // await sendSaleNotificationEmail(vendedor.email, cobranca, valorLiquido)

        console.log("📧 Emails de confirmação enviados")
      }

      // TODO: Liberar acesso ao produto para o comprador
      // await grantProductAccess(cobranca.buyerEmail, cobranca.productId)

      console.log("🎉 Venda processada com sucesso!")
    }

    return NextResponse.json({
      message: "Webhook processado com sucesso",
      txid,
      status,
    })
  } catch (error) {
    console.error("❌ Erro no webhook:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}

// Endpoint para simular webhook em desenvolvimento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const txid = searchParams.get("txid")
    const status = searchParams.get("status") || "paid"

    if (!txid) {
      return NextResponse.json({ message: "TXID é obrigatório" }, { status: 400 })
    }

    console.log("🧪 Simulando webhook:", { txid, status })

    // Simular payload do webhook
    const mockPayload = {
      evento: status === "paid" ? "cobranca_paga" : "cobranca_vencida",
      cobranca: {
        txid,
        valor: {
          original: "80.00",
        },
      },
    }

    // Processar como webhook real
    const { txid: processedTxid, status: processedStatus } = processWebhookPayload(mockPayload)

    const cobranca = CobrancaDB.findByTxid(processedTxid)
    if (!cobranca) {
      return NextResponse.json({ message: "Cobrança não encontrada" }, { status: 404 })
    }

    CobrancaDB.updateStatus(processedTxid, processedStatus as any)

    if (processedStatus === "paid") {
      const financialSettings = FinancialSettingsDB.get()
      const valorBruto = cobranca.amount
      const taxaRetencao = (valorBruto * financialSettings.taxaRetencaoVenda) / 100
      const taxaFixa = financialSettings.taxaFixaVenda
      const valorLiquido = valorBruto - taxaRetencao - taxaFixa

      UserDB.addSaldo(cobranca.sellerId, valorLiquido)

      SaldoDB.create({
        userId: cobranca.sellerId,
        cobrancaId: cobranca.id,
        entrada: valorBruto,
        taxaRetencao,
        taxaFixa,
        valorFinal: valorLiquido,
      })
    }

    return NextResponse.json({
      message: "Webhook simulado com sucesso",
      txid: processedTxid,
      status: processedStatus,
      mock: true,
    })
  } catch (error) {
    console.error("❌ Erro na simulação:", error)
    return NextResponse.json({ message: "Erro interno" }, { status: 500 })
  }
}
