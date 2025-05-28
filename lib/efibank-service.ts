import crypto from "crypto"
import fs from "fs"
import qs from "qs"
import https from "https"
import axios from "axios"

interface EfiBankCredentials {
  clientId: string
  clientSecret: string
  certificate?: Buffer
  sandbox: boolean
  pixKey: string
}

interface PixChargeData {
  txid: string
  valor: number
  cpf: string
  nome: string
  descricao: string
  expiracao?: number
}

interface EfiBankPixResponse {
  txid: string
  status: string
  valor: { original: string }
  chave: string
  solicitacaoPagador: string
  calendario: { criacao: string; expiracao: number }
}

interface QRCodeResponse {
  qrcode: string
  imagemQrcode: string
  linkVisualizacao?: string
}

export class EfiBankService {
  private credentials: EfiBankCredentials
  private baseUrl: string
  private accessToken?: string
  private tokenExpiry?: Date

  constructor() {
    this.credentials = {
      clientId: process.env.EFIBANK_CLIENT_ID || "",
      clientSecret: process.env.EFIBANK_CLIENT_SECRET || "",
      sandbox: process.env.EFIBANK_SANDBOX === "true",
      pixKey: process.env.PIX_KEY || "",
    }

    if (process.env.PIX_CERTIFICADO) {
      try {
        this.credentials.certificate = Buffer.from(process.env.PIX_CERTIFICADO, "base64")
        console.log("✅ Certificado EfiBank carregado via base64")
      } catch (error) {
        console.warn("⚠️ Erro ao decodificar certificado base64:", (error as any).message)
      }
    } else if (process.env.EFIBANK_CERTIFICATE_PATH && fs.existsSync(process.env.EFIBANK_CERTIFICATE_PATH)) {
      try {
        this.credentials.certificate = fs.readFileSync(process.env.EFIBANK_CERTIFICATE_PATH)
        console.log("✅ Certificado EfiBank carregado via arquivo")
      } catch (error) {
        console.warn("⚠️ Erro ao carregar certificado do arquivo:", (error as any).message)
      }
    }

    this.baseUrl = this.credentials.sandbox
      ? "https://pix-h.api.efipay.com.br"
      : "https://pix.api.efipay.com.br"

    console.log("🔧 EfiBank Service inicializado:", {
      ambiente: this.credentials.sandbox ? "SANDBOX" : "PRODUÇÃO",
      baseUrl: this.baseUrl,
      clientId: this.credentials.clientId ? "✅" : "❌",
      clientSecret: this.credentials.clientSecret ? "✅" : "❌",
      pixKey: this.credentials.pixKey ? "✅" : "❌",
      certificate: this.credentials.certificate ? "✅" : "❌",
    })
  }

  public isConfigured(): boolean {
    return !!(this.credentials.clientId && this.credentials.clientSecret && this.credentials.pixKey && this.credentials.certificate)
  }

public async getAccessToken(): Promise<string> {
  if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
    return this.accessToken;
  }

  console.log("🔑 Obtendo novo token de acesso...");

  try {
    const httpsAgent = new https.Agent({
      pfx: this.credentials.certificate,
      passphrase: "",
      rejectUnauthorized: !this.credentials.sandbox,
    });

    const authHeader = Buffer.from(`${this.credentials.clientId}:${this.credentials.clientSecret}`).toString("base64");

    const response = await axios.post(
     `${this.baseUrl}/oauth/token`,
     qs.stringify({ grant_type: "client_credentials" }), // CORRETO
  {
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded", // CORRETO
    },
    httpsAgent,
  }
 );

    const tokenData = response.data;
    this.accessToken = tokenData.access_token;
    this.tokenExpiry = new Date(Date.now() + (tokenData.expires_in - 300) * 1000);

    console.log("✅ Token obtido com sucesso, expira em:", this.tokenExpiry.toLocaleString());
    return this.accessToken;
  } catch (error: any) {
    console.error("❌ Erro ao obter token:", error.response?.data || error.message);
    throw new Error("Erro de autenticação EfiBank");
  }
}

async createPixCharge(data: PixChargeData) {
  if (!this.isConfigured()) {
    throw new Error("Credenciais EfiBank não configuradas")
  }

  console.log("💳 Criando cobrança PIX...")
  console.log("📋 Dados:", {
    txid: data.txid,
    valor: data.valor,
    nome: data.nome,
    cpf: data.cpf.substring(0, 3) + "***",
  })

  const httpsAgent = new https.Agent({
    pfx: this.credentials.certificate,
    passphrase: "",
    rejectUnauthorized: !this.credentials.sandbox,
  })

  const accessToken = await this.getAccessToken()

  const pixPayload = {
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
    chave: this.credentials.pixKey,
    solicitacaoPagador: data.descricao,
  }

  console.log("🚨 Enviando payload PIX:", pixPayload) // <-- log aqui

  try {
    const chargeResponse = await axios.put<EfiBankPixResponse>(
      `${this.baseUrl}/v2/cob/${data.txid}`,
      pixPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        httpsAgent,
      }
    )

    console.log("✅ Cobrança criada:", chargeResponse.data.txid)

    const locId = chargeResponse.data.loc?.id

if (!locId) {
  throw new Error("Loc ID não encontrado na resposta da cobrança.")
}

const qrResponse = await axios.get<QRCodeResponse>(
  `${this.baseUrl}/v2/loc/${locId}/qrcode`,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    httpsAgent,
  }
)

    console.log("✅ QR Code obtido com sucesso")

    const expiresAt = new Date(Date.now() + (data.expiracao || 3600) * 1000).toISOString()

    return {
      txid: chargeResponse.data.txid,
      qrCode: qrResponse.data.imagemQrcode,
      copyPasteCode: qrResponse.data.qrcode,
      linkPagamento: qrResponse.data.linkVisualizacao,
      expiresAt,
      valor: data.valor,
    }
  } catch (error: any) {
    console.error("❌ Erro ao criar cobrança:", error.response?.data || error.message)
    throw new Error("Erro ao criar cobrança PIX")
  }
}


  static generateTxId(): string {
    const timestamp = Date.now().toString()
    const random = crypto.randomBytes(8).toString("hex").toUpperCase()
    return `${timestamp}${random}`.substring(0, 35)
  }
}

export const efiBankService = new EfiBankService()
