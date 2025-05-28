import https from "https"

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

interface PixChargeData {
  value: number
  payerName: string
  payerDocument: string
  description?: string
}

interface PixChargeResponse {
  txid: string
  qrCode: string
  pixCopiaECola: string
  status: string
  valor: string
}

// Função para obter token de acesso
export async function getGerencianetToken(): Promise<{ token: string }> {
  const clientId = process.env.PIX_CLIENT_ID
  const clientSecret = process.env.PIX_SECRET_KEY
  const baseUrl = process.env.PIX_BASE_URL || "https://pix.api.efipay.com.br"

  if (!clientId || !clientSecret) {
    throw new Error("Credenciais PIX não configuradas")
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  // Configurar certificado se estiver em produção
  let agent
  if (process.env.PIX_CERTIFICADO && baseUrl.includes("pix.api.efipay.com.br")) {
    const cert = Buffer.from(process.env.PIX_CERTIFICADO, "base64")
    agent = new https.Agent({
      pfx: cert,
      passphrase: "", // Geralmente vazio para certificados da EfiBank
    })
  }

  const response = await fetch(`${baseUrl}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
      "User-Agent": "NodeJS-EfiPay-SDK",
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
    }),
    // @ts-ignore - agent só funciona no Node.js
    agent,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Erro ao obter token:", response.status, errorText)
    throw new Error(`Erro ao obter token: ${response.status}`)
  }

  const data: TokenResponse = await response.json()
  return { token: data.access_token }
}

// Função para criar cobrança PIX
export async function createPixCharge(data: PixChargeData): Promise<PixChargeResponse> {
  const { token } = await getGerencianetToken()
  const baseUrl = process.env.PIX_BASE_URL || "https://pix.api.efipay.com.br"
  const pixKey = process.env.PIX_KEY

  if (!pixKey) {
    throw new Error("Chave PIX não configurada")
  }

  // Gerar TXID único
  const txid = `PIX${Date.now()}${Math.random().toString(36).substring(2, 15)}`

  const pixData = {
    calendario: {
      expiracao: 3600, // 1 hora
    },
    devedor: {
      cpf: data.payerDocument.replace(/\D/g, ""),
      nome: data.payerName,
    },
    valor: {
      original: data.value.toFixed(2),
    },
    chave: pixKey,
    solicitacaoPagador: data.description || "Cobrança PIX",
  }

  // Configurar certificado se estiver em produção
  let agent
  if (process.env.PIX_CERTIFICADO && baseUrl.includes("pix.api.efipay.com.br")) {
    const cert = Buffer.from(process.env.PIX_CERTIFICADO, "base64")
    agent = new https.Agent({
      pfx: cert,
      passphrase: "",
    })
  }

  // Criar cobrança
  const chargeResponse = await fetch(`${baseUrl}/v2/cob/${txid}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "NodeJS-EfiPay-SDK",
    },
    body: JSON.stringify(pixData),
    // @ts-ignore
    agent,
  })

  if (!chargeResponse.ok) {
    const errorText = await chargeResponse.text()
    console.error("Erro ao criar cobrança:", chargeResponse.status, errorText)
    throw new Error(`Erro ao criar cobrança: ${chargeResponse.status}`)
  }

  const chargeData = await chargeResponse.json()

  // Gerar QR Code
  const qrResponse = await fetch(`${baseUrl}/v2/loc/${chargeData.loc.id}/qrcode`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "NodeJS-EfiPay-SDK",
    },
    // @ts-ignore
    agent,
  })

  if (!qrResponse.ok) {
    const errorText = await qrResponse.text()
    console.error("Erro ao gerar QR Code:", qrResponse.status, errorText)
    throw new Error(`Erro ao gerar QR Code: ${qrResponse.status}`)
  }

  const qrData = await qrResponse.json()

  return {
    txid: chargeData.txid,
    qrCode: qrData.imagemQrcode,
    pixCopiaECola: qrData.qrcode,
    status: chargeData.status,
    valor: data.value.toFixed(2),
  }
}

// Função para verificar status do PIX
export async function checkPixStatus(txid: string) {
  const { token } = await getGerencianetToken()
  const baseUrl = process.env.PIX_BASE_URL || "https://pix.api.efipay.com.br"

  // Configurar certificado se estiver em produção
  let agent
  if (process.env.PIX_CERTIFICADO && baseUrl.includes("pix.api.efipay.com.br")) {
    const cert = Buffer.from(process.env.PIX_CERTIFICADO, "base64")
    agent = new https.Agent({
      pfx: cert,
      passphrase: "",
    })
  }

  const response = await fetch(`${baseUrl}/v2/cob/${txid}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "NodeJS-EfiPay-SDK",
    },
    // @ts-ignore
    agent,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Erro ao verificar status:", response.status, errorText)
    throw new Error(`Erro ao verificar status: ${response.status}`)
  }

  const data = await response.json()

  return {
    status: data.status,
    pago: data.status === "CONCLUIDA",
    valor: data.valor?.original,
    txid: data.txid,
  }
}

// Função para enviar PIX (se necessário)
export async function sendPix(data: any) {
  // Implementação para envio de PIX se necessário
  throw new Error("Função sendPix não implementada ainda")
}
