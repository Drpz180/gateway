import crypto from "crypto"

interface EfiBankConfig {
  clientId: string
  clientSecret: string
  sandbox: boolean
  pixKey: string
  certificate?: string
}

interface PixChargeRequest {
  txid: string
  valor: number
  cpf: string
  nome: string
  descricao: string
  expiracao?: number
}

export class EfiBankVercel {
  private config: EfiBankConfig
  private baseUrl: string

  constructor() {
    this.config = {
      clientId: process.env.EFIBANK_CLIENT_ID || "",
      clientSecret: process.env.EFIBANK_CLIENT_SECRET || "",
      sandbox: process.env.EFIBANK_SANDBOX === "true",
      pixKey: process.env.EFIBANK_PIX_KEY || "",
      certificate: process.env.EFIBANK_CERTIFICATE_BASE64 || "",
    }

    // URLs corretas para cada ambiente
    this.baseUrl = this.config.sandbox ? "https://pix-h.api.efipay.com.br" : "https://pix.api.efipay.com.br"
  }

  /**
   * Método que funcionou em projetos anteriores na Vercel
   */
  async createPixCharge(data: PixChargeRequest) {
    try {
      console.log("🚀 Iniciando criação PIX (método Vercel-friendly)...")

      // 1. Obter token de acesso
      const token = await this.getAccessToken()

      // 2. Criar cobrança
      const cobranca = await this.createCharge(token, data)

      // 3. Obter QR Code
      const qrCode = await this.getQRCode(token, data.txid)

      return {
        success: true,
        txid: cobranca.txid,
        qrCode: qrCode.imagemQrcode,
        copyPasteCode: qrCode.qrcode,
        linkPagamento: qrCode.linkVisualizacao,
        expiresAt: new Date(Date.now() + (data.expiracao || 3600) * 1000).toISOString(),
        valor: data.valor,
      }
    } catch (error) {
      console.error("❌ Erro na criação PIX:", error)
      throw error
    }
  }

  /**
   * Obter token - método otimizado para Vercel
   */
  private async getAccessToken(): Promise<string> {
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64")

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        "User-Agent": "InfoPlatform-Vercel/1.0",
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
      }),
      // Configurações específicas que funcionaram antes
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erro de autenticação: ${response.status} - ${errorText}`)
    }

    const tokenData = await response.json()
    return tokenData.access_token
  }

  /**
   * Criar cobrança PIX
   */
  private async createCharge(token: string, data: PixChargeRequest) {
    const payload = {
      calendario: {
        expiracao: data.expiracao || 3600,
      },
      devedor: {
        cpf: data.cpf.replace(/\D/g, ""),
        nome: data.nome,
      },
      valor: {
        original: data.valor.toFixed(2),
      },
      chave: this.config.pixKey,
      solicitacaoPagador: data.descricao,
    }

    const response = await fetch(`${this.baseUrl}/v2/cob/${data.txid}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "InfoPlatform-Vercel/1.0",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erro ao criar cobrança: ${response.status} - ${errorText}`)
    }

    return await response.json()
  }

  /**
   * Obter QR Code
   */
  private async getQRCode(token: string, txid: string) {
    const response = await fetch(`${this.baseUrl}/v2/cob/${txid}/qrcode`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "InfoPlatform-Vercel/1.0",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erro ao obter QR Code: ${response.status} - ${errorText}`)
    }

    return await response.json()
  }

  /**
   * Verificar se está configurado
   */
  isConfigured(): boolean {
    return !!(this.config.clientId && this.config.clientSecret && this.config.pixKey)
  }

  /**
   * Gerar TXID único
   */
  static generateTxId(): string {
    const timestamp = Date.now().toString()
    const random = crypto.randomBytes(6).toString("hex").toUpperCase()
    return `PIX${timestamp}${random}`.substring(0, 35)
  }
}

export const efiBankVercel = new EfiBankVercel()
