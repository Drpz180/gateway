interface EfiBankConfig {
  clientId: string
  clientSecret: string
  certificate: string // base64
  sandbox: boolean
  pixKey: string
}

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

export class EfiBankOficial {
  private config: EfiBankConfig
  private baseUrl: string

  constructor() {
    this.config = {
      clientId: process.env.PIX_CLIENT_ID || "",
      clientSecret: process.env.PIX_SECRET_KEY || "",
      certificate: process.env.PIX_CERTIFICADO || "",
      sandbox: process.env.PIX_BASE_URL?.includes("pix-h") || false,
      pixKey: process.env.PIX_KEY || "",
    }

    // URLs oficiais da documentação
    this.baseUrl = this.config.sandbox
      ? "https://pix-h.api.efipay.com.br" // Homologação
      : "https://pix.api.efipay.com.br" // Produção

    console.log("🔧 EfiBank inicializado:", {
      baseUrl: this.baseUrl,
      sandbox: this.config.sandbox,
      hasClientId: !!this.config.clientId,
      hasClientSecret: !!this.config.clientSecret,
      hasPixKey: !!this.config.pixKey,
      hasCertificate: !!this.config.certificate,
    })
  }

  // Obter token OAuth2 conforme documentação
  async getAccessToken(): Promise<string> {
    try {
      const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64")

      console.log("🔑 Obtendo token de:", `${this.baseUrl}/oauth/token`)

      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
          "User-Agent": "EfiPay-NodeJS-SDK/1.0.0",
          Accept: "application/json",
        },
        body: JSON.stringify({
          grant_type: "client_credentials",
        }),
      })

      console.log("📊 Resposta token - Status:", response.status)
      console.log("📊 Resposta token - Headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Erro ao obter token:", response.status, errorText)
        throw new Error(`Erro ao obter token: ${response.status} - ${errorText}`)
      }

      const data: TokenResponse = await response.json()
      console.log("✅ Token obtido com sucesso")

      return data.access_token
    } catch (error) {
      console.error("❌ Erro na obtenção do token:", error)
      throw error
    }
  }

  // Verificar se está configurado corretamente
  isConfigured(): boolean {
    const configured = !!(
      this.config.clientId &&
      this.config.clientSecret &&
      this.config.pixKey &&
      (this.config.sandbox || this.config.certificate)
    )

    console.log("🔍 Verificação de configuração:", {
      clientId: !!this.config.clientId,
      clientSecret: !!this.config.clientSecret,
      pixKey: !!this.config.pixKey,
      certificate: !!this.config.certificate,
      sandbox: this.config.sandbox,
      configured,
    })

    return configured
  }

  getConfig() {
    return {
      clientId: !!this.config.clientId,
      clientSecret: !!this.config.clientSecret,
      certificate: !!this.config.certificate,
      pixKey: !!this.config.pixKey,
      sandbox: this.config.sandbox,
      baseUrl: this.baseUrl,
    }
  }
}
