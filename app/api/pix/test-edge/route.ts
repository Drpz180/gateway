import { type NextRequest, NextResponse } from "next/server"

// Usar Edge Runtime para menos restrições de rede
export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [EDGE] Testando credenciais da EFI Pay...")

    // Verificar variáveis de ambiente
    const envVars = {
      PIX_CLIENT_ID: !!process.env.PIX_CLIENT_ID,
      PIX_SECRET_KEY: !!process.env.PIX_SECRET_KEY,
      PIX_BASE_URL: process.env.PIX_BASE_URL || "https://pix.api.efipay.com.br",
      PIX_CERTIFICADO: !!process.env.PIX_CERTIFICADO,
      PIX_KEY: !!process.env.PIX_KEY,
    }

    if (!process.env.PIX_CLIENT_ID || !process.env.PIX_SECRET_KEY) {
      return NextResponse.json({
        success: false,
        message: "Credenciais não configuradas",
        envVars,
      })
    }

    const clientId = process.env.PIX_CLIENT_ID
    const clientSecret = process.env.PIX_SECRET_KEY
    const baseUrl = process.env.PIX_BASE_URL || "https://pix.api.efipay.com.br"

    // Tentar sandbox primeiro (mais provável de funcionar)
    const sandboxUrl = "https://pix-h.api.efipay.com.br"

    console.log("🔧 [EDGE] Tentando sandbox primeiro...")

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    try {
      const response = await fetch(`${sandboxUrl}/oauth/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; InfoPlatform/1.0)",
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          grant_type: "client_credentials",
        }),
      })

      console.log("📡 [EDGE] Status sandbox:", response.status)

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          success: true,
          message: "✅ Credenciais válidas! (Sandbox)",
          environment: "sandbox",
          tokenObtido: !!data.access_token,
          envVars,
        })
      }
    } catch (sandboxError) {
      console.log("⚠️ [EDGE] Sandbox falhou, tentando produção...")
    }

    // Tentar produção
    try {
      const response = await fetch(`${baseUrl}/oauth/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; InfoPlatform/1.0)",
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          grant_type: "client_credentials",
        }),
      })

      console.log("📡 [EDGE] Status produção:", response.status)

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          success: true,
          message: "✅ Credenciais válidas! (Produção)",
          environment: "production",
          tokenObtido: !!data.access_token,
          envVars,
        })
      } else {
        const errorText = await response.text()
        return NextResponse.json({
          success: false,
          message: `❌ Erro HTTP ${response.status}`,
          error: errorText,
          envVars,
        })
      }
    } catch (prodError) {
      console.error("❌ [EDGE] Erro produção:", prodError)

      return NextResponse.json({
        success: false,
        message: "❌ Não foi possível conectar com a EfiBank",
        error: prodError instanceof Error ? prodError.message : String(prodError),
        suggestion: "Tente configurar um webhook ou usar sistema mock para desenvolvimento",
        envVars,
      })
    }
  } catch (error) {
    console.error("❌ [EDGE] Erro geral:", error)

    return NextResponse.json({
      success: false,
      message: "❌ Erro interno",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
