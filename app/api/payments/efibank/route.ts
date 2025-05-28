import { type NextRequest, NextResponse } from "next/server"

const EFIBANK_CONFIG = {
  client_id: process.env.EFIBANK_CLIENT_ID,
  client_secret: process.env.EFIBANK_CLIENT_SECRET,
  sandbox: process.env.EFIBANK_SANDBOX === "true",
  certificate: null, // Add certificate path in production
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se as credenciais estão configuradas
    if (!EFIBANK_CONFIG.client_id || !EFIBANK_CONFIG.client_secret) {
      console.error("EfiBank credentials not configured")
      return NextResponse.json({ message: "Configuração de pagamento não encontrada" }, { status: 500 })
    }

    const { productId, amount, paymentMethod, customerData, affiliateId } = await request.json()

    // Validar dados obrigatórios
    if (!productId || !amount || !customerData.name || !customerData.email) {
      return NextResponse.json({ message: "Dados obrigatórios não fornecidos" }, { status: 400 })
    }

    console.log("Processing payment:", {
      productId,
      amount,
      paymentMethod,
      customer: customerData.name,
      sandbox: EFIBANK_CONFIG.sandbox,
    })

    // Gerar ID único para a transação
    const txid = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    if (paymentMethod === "pix") {
      // Criar cobrança PIX
      const pixPayment = await createPixPayment({
        txid,
        amount,
        customerData,
        productId,
        affiliateId,
      })

      return NextResponse.json({
        success: true,
        paymentMethod: "pix",
        txid,
        qrCode: pixPayment.qrCode,
        pixCode: pixPayment.pixCode,
        expiresAt: pixPayment.expiresAt,
        message: "PIX gerado com sucesso",
      })
    } else if (paymentMethod === "credit_card") {
      // Criar cobrança com cartão
      const cardPayment = await createCardPayment({
        txid,
        amount,
        customerData,
        productId,
        affiliateId,
      })

      return NextResponse.json({
        success: true,
        paymentMethod: "credit_card",
        txid,
        paymentUrl: cardPayment.paymentUrl,
        message: "Redirecionando para pagamento",
      })
    }

    return NextResponse.json({ message: "Método de pagamento não suportado" }, { status: 400 })
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json({ message: "Erro ao processar pagamento" }, { status: 500 })
  }
}

async function createPixPayment(data: any) {
  try {
    // Simular criação de PIX no EfiBank
    // Em produção, fazer chamada real para a API do EfiBank

    const pixCode = `00020126580014br.gov.bcb.pix0136${data.txid}5204000053039865802BR5925${data.customerData.name}6009SAO PAULO62070503***6304`

    return {
      qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
      pixCode,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
    }
  } catch (error) {
    console.error("Error creating PIX payment:", error)
    throw error
  }
}

async function createCardPayment(data: any) {
  try {
    // Simular criação de pagamento com cartão no EfiBank
    // Em produção, fazer chamada real para a API do EfiBank

    const paymentUrl = EFIBANK_CONFIG.sandbox
      ? `https://sandbox.efibank.com.br/checkout/${data.txid}`
      : `https://efibank.com.br/checkout/${data.txid}`

    return {
      paymentUrl,
    }
  } catch (error) {
    console.error("Error creating card payment:", error)
    throw error
  }
}

// Função para obter token de acesso do EfiBank
async function getEfiBankAccessToken() {
  try {
    const baseUrl = EFIBANK_CONFIG.sandbox ? "https://sandbox.efibank.com.br" : "https://api.efibank.com.br"

    const credentials = Buffer.from(`${EFIBANK_CONFIG.client_id}:${EFIBANK_CONFIG.client_secret}`).toString("base64")

    const response = await fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get access token")
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error("Error getting EfiBank access token:", error)
    throw error
  }
}
