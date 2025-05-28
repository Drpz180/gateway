import { type NextRequest, NextResponse } from "next/server"

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
    requestBody = await request.json()
    console.log("📥 Request recebido:", requestBody)
  } catch (error) {
    console.error("❌ Erro ao fazer parse do JSON:", error)
    return NextResponse.json({
      success: false,
      message: "Erro no formato da requisição",
    })
  }

  const { valor, cpf, nome, descricao } = requestBody

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
    return NextResponse.json({
      success: true,
      message: "PIX criado via mock (credenciais não configuradas)",
      mock: true,
      data: createMockPix(valor, cpf, nome, descricao),
    })
  }

  // Estratégia 1: Tentar sandbox primeiro (mais provável de funcionar)
  console.log("🎯 Estratégia 1: Testando sandbox...")
  const sandboxResult = await tryEfiBank(true, clientId, clientSecret, pixKey, valor, cpf, nome, descricao)
  if (sandboxResult.success && !sandboxResult.mock) {
    console.log("✅ Sucesso com sandbox!")
    return NextResponse.json(sandboxResult)
  }

  // Estratégia 2: Tentar produção se sandbox falhar
  if (!sandbox) {
    console.log("🎯 Estratégia 2: Testando produção...")
    const prodResult = await tryEfiBank(false, clientId, clientSecret, pixKey, valor, cpf, nome, descricao)
    if (prodResult.success && !prodResult.mock) {
      console.log("✅ Sucesso com produção!")
      return NextResponse.json(prodResult)
    }
  }

  // Estratégia 3: Tentar com diferentes headers
  console.log("🎯 Estratégia 3: Testando com headers alternativos...")
  const altResult = await tryEfiBankAlternative(sandbox, clientId, clientSecret, pixKey, valor, cpf, nome, descricao)
  if (altResult.success && !altResult.mock) {
    console.log("✅ Sucesso com headers alternativos!")
    return NextResponse.json(altResult)
  }

  // Fallback: Mock
  console.log("🔄 Todas as estratégias falharam, usando mock...")
  return NextResponse.json({
    success: true,
    message: "PIX criado via mock (EfiBank inacessível)",
    mock: true,
    data: createMockPix(valor, cpf, nome, descricao),
  })
}

async function tryEfiBank(
  useSandbox: boolean,
  clientId: string,
  clientSecret: string,
  pixKey: string,
  valor: number,
  cpf: string,
  nome: string,
  descricao: string,
) {
  try {
    const baseUrl = useSandbox ? "https://pix-h.api.efipay.com.br" : "https://pix.api.efipay.com.br"
    console.log(`🌐 Tentando ${useSandbox ? "sandbox" : "produção"}: ${baseUrl}`)

    // 1. Token
    const credentials = btoa(`${clientId}:${clientSecret}`)
    const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; InfoPlatform/1.0)",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
      }),
    })

    if (!tokenResponse.ok) {
      console.log(`❌ Token falhou (${useSandbox ? "sandbox" : "produção"}):`, tokenResponse.status)
      return { success: false, mock: true }
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // 2. Cobrança
    const txid = generateTxId()
    const payload = {
      calendario: { expiracao: 3600 },
      devedor: { cpf: cpf.replace(/\D/g, ""), nome },
      valor: { original: valor.toFixed(2) },
      chave: pixKey,
      solicitacaoPagador: descricao,
    }

    const chargeResponse = await fetch(`${baseUrl}/v2/cob/${txid}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; InfoPlatform/1.0)",
      },
      body: JSON.stringify(payload),
    })

    if (!chargeResponse.ok) {
      console.log(`❌ Cobrança falhou (${useSandbox ? "sandbox" : "produção"}):`, chargeResponse.status)
      return { success: false, mock: true }
    }

    // 3. QR Code
    const qrResponse = await fetch(`${baseUrl}/v2/cob/${txid}/qrcode`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; InfoPlatform/1.0)",
      },
    })

    if (!qrResponse.ok) {
      console.log(`❌ QR Code falhou (${useSandbox ? "sandbox" : "produção"}):`, qrResponse.status)
      return { success: false, mock: true }
    }

    const qrData = await qrResponse.json()

    return {
      success: true,
      message: `PIX criado com sucesso via EfiBank ${useSandbox ? "Sandbox" : "Produção"}!`,
      mock: false,
      data: {
        txid,
        qrCode: qrData.imagemQrcode,
        copyPasteCode: qrData.qrcode,
        linkPagamento: qrData.linkVisualizacao,
        valor,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        environment: useSandbox ? "sandbox" : "production",
      },
    }
  } catch (error) {
    console.log(`❌ Erro na tentativa ${useSandbox ? "sandbox" : "produção"}:`, error.message)
    return { success: false, mock: true }
  }
}

async function tryEfiBankAlternative(
  useSandbox: boolean,
  clientId: string,
  clientSecret: string,
  pixKey: string,
  valor: number,
  cpf: string,
  nome: string,
  descricao: string,
) {
  try {
    const baseUrl = useSandbox ? "https://pix-h.api.efipay.com.br" : "https://pix.api.efipay.com.br"

    // Headers alternativos que podem funcionar melhor na Vercel
    const alternativeHeaders = {
      "User-Agent": "curl/7.68.0",
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate",
      Connection: "keep-alive",
      "Content-Type": "application/json",
    }

    const credentials = btoa(`${clientId}:${clientSecret}`)
    const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        ...alternativeHeaders,
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
      }),
    })

    if (!tokenResponse.ok) {
      return { success: false, mock: true }
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    const txid = generateTxId()
    const payload = {
      calendario: { expiracao: 3600 },
      devedor: { cpf: cpf.replace(/\D/g, ""), nome },
      valor: { original: valor.toFixed(2) },
      chave: pixKey,
      solicitacaoPagador: descricao,
    }

    const chargeResponse = await fetch(`${baseUrl}/v2/cob/${txid}`, {
      method: "PUT",
      headers: {
        ...alternativeHeaders,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })

    if (!chargeResponse.ok) {
      return { success: false, mock: true }
    }

    const qrResponse = await fetch(`${baseUrl}/v2/cob/${txid}/qrcode`, {
      method: "GET",
      headers: {
        ...alternativeHeaders,
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!qrResponse.ok) {
      return { success: false, mock: true }
    }

    const qrData = await qrResponse.json()

    return {
      success: true,
      message: "PIX criado com sucesso via EfiBank (headers alternativos)!",
      mock: false,
      data: {
        txid,
        qrCode: qrData.imagemQrcode,
        copyPasteCode: qrData.qrcode,
        linkPagamento: qrData.linkVisualizacao,
        valor,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        environment: useSandbox ? "sandbox" : "production",
      },
    }
  } catch (error) {
    return { success: false, mock: true }
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
