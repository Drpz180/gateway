import { type NextRequest, NextResponse } from "next/server"

// Edge Runtime tem menos restrições de rede
export const runtime = "edge"

interface PixRequest {
  valor: number
  cpf: string
  nome: string
  descricao: string
}

export async function POST(request: NextRequest) {
  let requestBody: PixRequest

  try {
    // Parse do body uma única vez
    requestBody = await request.json()
    console.log("📥 Request recebido:", requestBody)
  } catch (error) {
    console.error("❌ Erro ao fazer parse do JSON:", error)
    return NextResponse.json({
      success: false,
      message: "Erro no formato da requisição",
      mock: true,
      data: createMockPix(67.9, "12345678901", "Teste", "Teste PIX"),
    })
  }

  const { valor, cpf, nome, descricao } = requestBody

  try {
    console.log("🚀 Iniciando criação de PIX...")

    // Configurações
    const clientId = process.env.EFIBANK_CLIENT_ID
    const clientSecret = process.env.EFIBANK_CLIENT_SECRET
    const pixKey = process.env.EFIBANK_PIX_KEY
    const sandbox = process.env.EFIBANK_SANDBOX === "true"

    console.log("🔧 Configurações:", {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasPixKey: !!pixKey,
      sandbox,
    })

    if (!clientId || !clientSecret || !pixKey) {
      console.log("⚠️ Credenciais não configuradas, usando mock...")
      return NextResponse.json({
        success: true,
        message: "PIX criado via mock (credenciais não configuradas)",
        mock: true,
        data: createMockPix(valor, cpf, nome, descricao),
      })
    }

    const baseUrl = sandbox ? "https://pix-h.api.efipay.com.br" : "https://pix.api.efipay.com.br"
    console.log("🌐 URL base:", baseUrl)

    // 1. Tentar obter token
    console.log("🔑 Obtendo token de acesso...")
    const credentials = btoa(`${clientId}:${clientSecret}`)

    let tokenResponse: Response
    try {
      tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "InfoPlatform/1.0",
        },
        body: JSON.stringify({
          grant_type: "client_credentials",
        }),
      })
    } catch (fetchError) {
      console.log("❌ Erro no fetch do token:", fetchError)
      return NextResponse.json({
        success: true,
        message: "PIX criado via mock (erro de conectividade)",
        mock: true,
        data: createMockPix(valor, cpf, nome, descricao),
      })
    }

    if (!tokenResponse.ok) {
      console.log("❌ Falha na autenticação, status:", tokenResponse.status)
      const errorText = await tokenResponse.text().catch(() => "Erro desconhecido")
      console.log("❌ Resposta de erro:", errorText)

      return NextResponse.json({
        success: true,
        message: "PIX criado via mock (falha na autenticação EfiBank)",
        mock: true,
        data: createMockPix(valor, cpf, nome, descricao),
      })
    }

    let tokenData: any
    try {
      tokenData = await tokenResponse.json()
      console.log("✅ Token obtido com sucesso")
    } catch (jsonError) {
      console.log("❌ Erro ao fazer parse do token JSON:", jsonError)
      return NextResponse.json({
        success: true,
        message: "PIX criado via mock (erro no parse do token)",
        mock: true,
        data: createMockPix(valor, cpf, nome, descricao),
      })
    }

    const accessToken = tokenData.access_token

    // 2. Criar cobrança
    console.log("💰 Criando cobrança PIX...")
    const txid = generateTxId()
    const payload = {
      calendario: {
        expiracao: 3600,
      },
      devedor: {
        cpf: cpf.replace(/\D/g, ""),
        nome: nome,
      },
      valor: {
        original: valor.toFixed(2),
      },
      chave: pixKey,
      solicitacaoPagador: descricao,
    }

    console.log("📋 Payload da cobrança:", payload)

    let chargeResponse: Response
    try {
      chargeResponse = await fetch(`${baseUrl}/v2/cob/${txid}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "InfoPlatform/1.0",
        },
        body: JSON.stringify(payload),
      })
    } catch (fetchError) {
      console.log("❌ Erro no fetch da cobrança:", fetchError)
      return NextResponse.json({
        success: true,
        message: "PIX criado via mock (erro na criação da cobrança)",
        mock: true,
        data: createMockPix(valor, cpf, nome, descricao),
      })
    }

    if (!chargeResponse.ok) {
      console.log("❌ Falha na criação da cobrança, status:", chargeResponse.status)
      const errorText = await chargeResponse.text().catch(() => "Erro desconhecido")
      console.log("❌ Resposta de erro:", errorText)

      return NextResponse.json({
        success: true,
        message: "PIX criado via mock (falha na criação da cobrança)",
        mock: true,
        data: createMockPix(valor, cpf, nome, descricao),
      })
    }

    // 3. Obter QR Code
    console.log("📱 Obtendo QR Code...")
    let qrResponse: Response
    try {
      qrResponse = await fetch(`${baseUrl}/v2/cob/${txid}/qrcode`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "User-Agent": "InfoPlatform/1.0",
        },
      })
    } catch (fetchError) {
      console.log("❌ Erro no fetch do QR Code:", fetchError)
      return NextResponse.json({
        success: true,
        message: "PIX criado via mock (erro no QR Code)",
        mock: true,
        data: createMockPix(valor, cpf, nome, descricao),
      })
    }

    if (!qrResponse.ok) {
      console.log("❌ Falha no QR Code, status:", qrResponse.status)
      return NextResponse.json({
        success: true,
        message: "PIX criado via mock (falha no QR Code)",
        mock: true,
        data: createMockPix(valor, cpf, nome, descricao),
      })
    }

    const qrData = await qrResponse.json()
    console.log("🎉 PIX real criado com sucesso!")

    return NextResponse.json({
      success: true,
      message: "PIX criado com sucesso via EfiBank!",
      mock: false,
      data: {
        txid,
        qrCode: qrData.imagemQrcode,
        copyPasteCode: qrData.qrcode,
        linkPagamento: qrData.linkVisualizacao,
        valor,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      },
    })
  } catch (error) {
    console.error("❌ Erro geral capturado:", error)

    // Fallback para mock em caso de qualquer erro
    return NextResponse.json({
      success: true,
      message: "PIX criado via mock (erro na conexão)",
      mock: true,
      data: createMockPix(
        requestBody?.valor || 67.9,
        requestBody?.cpf || "12345678901",
        requestBody?.nome || "Teste",
        requestBody?.descricao || "Teste PIX",
      ),
    })
  }
}

function generateTxId(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `PIX${timestamp}${random}`.substring(0, 35)
}

function createMockPix(valor: number, cpf: string, nome: string, descricao: string) {
  const txid = `MOCK${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  const mockQrCode = `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <g fill="black">
        ${Array.from({ length: 20 }, (_, i) =>
          Array.from({ length: 20 }, (_, j) => {
            const shouldFill = (i + j) % 3 === 0 || (i * j) % 7 === 0
            return shouldFill ? `<rect x="${j * 10}" y="${i * 10}" width="10" height="10"/>` : ""
          }).join(""),
        ).join("")}
      </g>
      <text x="100" y="190" text-anchor="middle" font-family="Arial" font-size="12" fill="black">PIX MOCK</text>
    </svg>
  `)}`

  return {
    txid,
    qrCode: mockQrCode,
    copyPasteCode: `00020126580014br.gov.bcb.pix0136${txid}520400005303986540${valor.toFixed(2)}5802BR5913${nome}6009SAO PAULO`,
    linkPagamento: `https://mock.pix.com/pay/${txid}`,
    valor,
    expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
  }
}
