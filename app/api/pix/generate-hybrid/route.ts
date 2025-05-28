import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, cpf, amount, description } = body

    console.log("🚀 [HYBRID] Gerando PIX:", { name, cpf, amount, description })

    // Validar dados
    if (!name || !cpf || !amount) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados incompletos",
        },
        { status: 400 },
      )
    }

    // Converter valor
    const numericAmount = Number.parseFloat(amount.toString().replace(/\./g, "").replace(",", "."))
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Valor inválido",
        },
        { status: 400 },
      )
    }

    // Tentar EfiBank primeiro
    const hasCredentials = process.env.PIX_CLIENT_ID && process.env.PIX_SECRET_KEY && process.env.PIX_KEY

    if (hasCredentials) {
      try {
        console.log("🔧 [HYBRID] Tentando EfiBank real...")

        const clientId = process.env.PIX_CLIENT_ID!
        const clientSecret = process.env.PIX_SECRET_KEY!
        const pixKey = process.env.PIX_KEY!

        // Tentar sandbox primeiro
        const sandboxUrl = "https://pix-h.api.efipay.com.br"
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

        // Obter token
        const tokenResponse = await fetch(`${sandboxUrl}/oauth/token`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (compatible; InfoPlatform/1.0)",
          },
          body: JSON.stringify({
            grant_type: "client_credentials",
          }),
        })

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json()
          const token = tokenData.access_token

          // Criar cobrança
          const txid = `PIX${Date.now()}${Math.random().toString(36).substring(2, 15)}`

          const pixData = {
            calendario: {
              expiracao: 3600,
            },
            devedor: {
              cpf: cpf.replace(/\D/g, ""),
              nome: name,
            },
            valor: {
              original: numericAmount.toFixed(2),
            },
            chave: pixKey,
            solicitacaoPagador: description || "Cobrança PIX",
          }

          const chargeResponse = await fetch(`${sandboxUrl}/v2/cob/${txid}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "User-Agent": "Mozilla/5.0 (compatible; InfoPlatform/1.0)",
            },
            body: JSON.stringify(pixData),
          })

          if (chargeResponse.ok) {
            const chargeData = await chargeResponse.json()

            // Gerar QR Code
            const qrResponse = await fetch(`${sandboxUrl}/v2/loc/${chargeData.loc.id}/qrcode`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "User-Agent": "Mozilla/5.0 (compatible; InfoPlatform/1.0)",
              },
            })

            if (qrResponse.ok) {
              const qrData = await qrResponse.json()

              console.log("✅ [HYBRID] PIX real criado com sucesso!")

              return NextResponse.json({
                success: true,
                data: {
                  txid: chargeData.txid,
                  qrCode: qrData.imagemQrcode,
                  pixCopiaECola: qrData.qrcode,
                  status: chargeData.status,
                  valor: numericAmount.toFixed(2),
                },
                environment: "efibank-sandbox",
              })
            }
          }
        }
      } catch (efiBankError) {
        console.log("⚠️ [HYBRID] EfiBank falhou, usando mock:", efiBankError)
      }
    }

    // Fallback para mock
    console.log("🎭 [HYBRID] Usando PIX mock...")

    const txid = `MOCK${Date.now()}${Math.random().toString(36).substring(2, 15)}`
    const pixCode = `00020126580014br.gov.bcb.pix0136${txid}0208${description || "Pagamento"}5204000053039865802BR5925InfoPlatform6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Gerar QR Code mock usando API pública
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`

    return NextResponse.json({
      success: true,
      data: {
        txid,
        qrCode: qrCodeUrl,
        pixCopiaECola: pixCode,
        status: "ATIVA",
        valor: numericAmount.toFixed(2),
      },
      environment: "mock",
      message: "PIX mock gerado (EfiBank não disponível)",
    })
  } catch (error) {
    console.error("❌ [HYBRID] Erro geral:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Erro ao gerar PIX",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
