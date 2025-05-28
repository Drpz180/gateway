import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("EfiBank Webhook received:", body)

    // Verificar se é um webhook válido do EfiBank
    const signature = request.headers.get("x-efibank-signature")

    if (!signature) {
      return NextResponse.json({ message: "Signature missing" }, { status: 400 })
    }

    // Processar diferentes tipos de eventos
    switch (body.evento) {
      case "cobranca_paga":
        await handlePaymentPaid(body)
        break
      case "cobranca_vencida":
        await handlePaymentExpired(body)
        break
      case "cobranca_cancelada":
        await handlePaymentCancelled(body)
        break
      default:
        console.log("Evento não reconhecido:", body.evento)
    }

    return NextResponse.json({ message: "Webhook processed" })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ message: "Webhook error" }, { status: 500 })
  }
}

async function handlePaymentPaid(data: any) {
  try {
    console.log("Payment paid:", data)

    // Aqui você atualizaria o status do pedido no banco de dados
    // Exemplo: marcar como pago, liberar acesso ao produto, etc.

    // Simular atualização no banco
    const orderId = data.txid || data.id
    console.log(`Order ${orderId} marked as paid`)

    // Enviar email de confirmação para o cliente
    // await sendConfirmationEmail(data.pagador.email)
  } catch (error) {
    console.error("Error handling payment paid:", error)
  }
}

async function handlePaymentExpired(data: any) {
  try {
    console.log("Payment expired:", data)

    // Marcar pedido como expirado
    const orderId = data.txid || data.id
    console.log(`Order ${orderId} marked as expired`)
  } catch (error) {
    console.error("Error handling payment expired:", error)
  }
}

async function handlePaymentCancelled(data: any) {
  try {
    console.log("Payment cancelled:", data)

    // Marcar pedido como cancelado
    const orderId = data.txid || data.id
    console.log(`Order ${orderId} marked as cancelled`)
  } catch (error) {
    console.error("Error handling payment cancelled:", error)
  }
}
