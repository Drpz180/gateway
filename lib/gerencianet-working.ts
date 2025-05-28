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

// Implementação simplificada sem certificado (para sandbox)
export async function getGerencianetToken(): Promise<{ token: string }> {
  const clientId = process.env.EFIBANK_CLIENT_ID
  const clientSecret = process.env.EFIBANK_CLIENT_SECRET
  const baseUrl = "https://pix-h.api.efipay.com.br" // Sempre sandbox para teste

  if (!clientId || !clientSecret) {
    throw new Error("Credenciais PIX não configuradas")
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  console.log("🔑 Obtendo token (implementação simplificada)...")

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
    const errorText = await response.text()
    console.error("❌ Erro ao obter token:", response.status, errorText)
    throw new Error(`Erro ao obter token: ${response.status} - ${errorText}`)
  }

  const data: TokenResponse = await response.json()
  console.log("✅ Token obtido com sucesso!")

  return { token: data.access_token }
}

export async function createPixCharge(data: PixChargeData): Promise<PixChargeResponse> {
  const { token } = await getGerencianetToken()
  const baseUrl = "https://pix-h.api.efipay.com.br"
  const pixKey = process.env.EFIBANK_PIX_KEY

  if (!pixKey) {
    throw new Error("Chave PIX não configurada")
  }

  // Gerar TXID único
  const txid = `PIX${Date.now()}${Math.random().toString(36).substring(2, 15)}`

  const pixData = {
    calendario: {
      expiracao: 3600,
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

  console.log("💳 Criando cobrança PIX (implementação simplificada)...")

  // Criar cobrança
  const chargeResponse = await fetch(`${baseUrl}/v2/cob/${txid}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pixData),
  })

  if (!chargeResponse.ok) {
    const errorText = await chargeResponse.text()
    console.error("❌ Erro ao criar cobrança:", chargeResponse.status, errorText)
    throw new Error(`Erro ao criar cobrança: ${chargeResponse.status} - ${errorText}`)
  }

  const chargeData = await chargeResponse.json()
  console.log("✅ Cobrança criada:", chargeData.txid)

  // Gerar QR Code
  const qrResponse = await fetch(`${baseUrl}/v2/cob/${txid}/qrcode`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!qrResponse.ok) {
    const errorText = await qrResponse.text()
    console.error("❌ Erro ao gerar QR Code:", qrResponse.status, errorText)
    throw new Error(`Erro ao gerar QR Code: ${qrResponse.status}`)
  }

  const qrData = await qrResponse.json()
  console.log("✅ QR Code gerado com sucesso!")

  return {
    txid: chargeData.txid,
    qrCode: qrData.imagemQrcode,
    pixCopiaECola: qrData.qrcode,
    status: chargeData.status,
    valor: data.value.toFixed(2),
  }
}
