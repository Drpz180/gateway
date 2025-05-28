import crypto from "crypto"
import https from "https"
import fs from "fs"

interface EfiBankConfig {
  clientId: string
  clientSecret: string
  baseUrl: string
  pixKey: string
  sandbox: boolean
  certificate?: string
}

interface PixChargeRequest {
  calendario: {
    expiracao: number
  }
  devedor: {
    cpf: string
    nome: string
  }
  valor: {
    original: string
  }
  chave: string
  solicitacaoPagador: string
}

interface PixChargeResponse {
  txid: string
  status: string
  valor: {
    original: string
  }
  chave: string
  solicitacaoPagador: string
  qrcode?: string
  imagemQrcode?: string
  linkVisualizacao?: string
}

export class EfiBankService {
  private config: EfiBankConfig

  constructor() {
    this.config = {
      clientId: process.env.EFIBANK_CLIENT_ID || "",
      clientSecret: process.env.EFIBANK_CLIENT_SECRET || "",
      baseUrl:
        process.env.EFIBANK_SANDBOX === "true" ? "https://pix-h.api.efipay.com.br" : "https://pix.api.efipay.com.br",
      pixKey: process.env.EFIBANK_PIX_KEY || "",
      sandbox: process.env.EFIBANK_SANDBOX === "true",
      certificate: process.env.EFIBANK_CERTIFICATE_PATH || "",
    }

    console.log("🔧 EfiBank Config:", {
      clientId: this.config.clientId ? "✅ Configurado" : "❌ Não configurado",
      clientSecret: this.config.clientSecret ? "✅ Configurado" : "❌ Não configurado",
      pixKey: this.config.pixKey ? "✅ Configurado" : "❌ Não configurado",
      sandbox: this.config.sandbox,
      baseUrl: this.config.baseUrl,
      certificate: this.config.certificate ? "✅ Configurado" : "❌ Não configurado",
    })
  }

  private async getAccessToken(): Promise<string> {
    try {
      console.log("🔑 Obtendo token de acesso da EfiBank...")

      const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64")

      // Configurar agente HTTPS com certificado se necessário
      let httpsAgent
      if (this.config.certificate && fs.existsSync(this.config.certificate)) {
        const cert = fs.readFileSync(this.config.certificate)
        httpsAgent = new https.Agent({
          cert: cert,
          rejectUnauthorized: !this.config.sandbox,
        })
      }

      const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "client_credentials",
        }),
        // @ts-ignore
        agent: httpsAgent,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Erro ao obter token:", response.status, errorText)
        throw new Error(`Failed to get access token: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("✅ Token obtido com sucesso")
      return data.access_token
    } catch (error) {
      console.error("❌ Erro ao obter token de acesso:", error)
      throw error
    }
  }

  async createPixCharge(data: {
    valor: number
    cpf: string
    nome: string
    descricao: string
    txid?: string
  }): Promise<{
    txid: string
    qrCode: string
    copyPasteCode: string
    linkPagamento: string
    expiresAt: string
    idCobranca: string
  }> {
    try {
      console.log("💳 Criando cobrança PIX REAL na EfiBank...")

      // Verificar se as credenciais estão configuradas
      if (!this.config.clientId || !this.config.clientSecret || !this.config.pixKey) {
        console.error("❌ Credenciais EfiBank não configuradas completamente")
        throw new Error("Credenciais EfiBank não configuradas")
      }

      console.log("🔑 Obtendo token de acesso...")
      const accessToken = await this.getAccessToken()
      const txid = data.txid || this.generateTxId()

      const pixData: PixChargeRequest = {
        calendario: {
          expiracao: 3600, // 1 hora
        },
        devedor: {
          cpf: data.cpf.replace(/\D/g, ""), // Remove formatação do CPF
          nome: data.nome,
        },
        valor: {
          original: data.valor.toFixed(2),
        },
        chave: this.config.pixKey,
        solicitacaoPagador: data.descricao,
      }

      console.log("📤 Enviando cobrança para EfiBank:", {
        txid,
        valor: pixData.valor.original,
        devedor: pixData.devedor.nome,
        chave: pixData.chave,
      })

      // Configurar agente HTTPS com certificado se necessário
      let httpsAgent
      if (this.config.certificate && fs.existsSync(this.config.certificate)) {
        const cert = fs.readFileSync(this.config.certificate)
        httpsAgent = new https.Agent({
          cert: cert,
          rejectUnauthorized: !this.config.sandbox,
        })
      }

      const response = await fetch(`${this.config.baseUrl}/v2/cob/${txid}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pixData),
        // @ts-ignore
        agent: httpsAgent,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Erro ao criar cobrança:", response.status, errorText)
        throw new Error(`Erro ao criar cobrança PIX: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("✅ Cobrança criada com sucesso:", result.txid)

      // Buscar QR Code
      console.log("🔍 Buscando QR Code...")
      const qrCodeResponse = await fetch(`${this.config.baseUrl}/v2/cob/${txid}/qrcode`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        // @ts-ignore
        agent: httpsAgent,
      })

      if (!qrCodeResponse.ok) {
        const errorText = await qrCodeResponse.text()
        console.error("❌ Erro ao obter QR Code:", qrCodeResponse.status, errorText)
        throw new Error(`Erro ao obter QR Code: ${qrCodeResponse.status} - ${errorText}`)
      }

      const qrCodeData = await qrCodeResponse.json()
      console.log("✅ QR Code obtido com sucesso")

      return {
        txid: result.txid,
        qrCode: qrCodeData.imagemQrcode || this.generateMockQRCode(),
        copyPasteCode: qrCodeData.qrcode,
        linkPagamento: qrCodeData.linkVisualizacao || `${this.config.baseUrl}/qr/${txid}`,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora
        idCobranca: result.txid,
      }
    } catch (error) {
      console.error("❌ Erro ao criar PIX real:", error)
      throw error
    }
  }

  private generateMockQRCode(): string {
    // QR Code base64 simples para fallback
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  }

  private generateTxId(): string {
    return crypto.randomBytes(16).toString("hex").toUpperCase()
  }

  validateWebhook(payload: string, signature: string): boolean {
    try {
      // Em desenvolvimento, sempre valida
      if (this.config.sandbox) {
        return true
      }

      // Implementar validação real da assinatura
      const expectedSignature = crypto.createHmac("sha256", this.config.clientSecret).update(payload).digest("hex")

      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    } catch (error) {
      console.error("Error validating webhook:", error)
      return false
    }
  }
}

export const efiBankService = new EfiBankService()
