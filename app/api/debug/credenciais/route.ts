import { NextResponse } from "next/server"

export async function GET() {
  try {
    const clientId = process.env.EFIBANK_CLIENT_ID
    const clientSecret = process.env.EFIBANK_CLIENT_SECRET
    const pixKey = process.env.EFIBANK_PIX_KEY
    const sandbox = process.env.EFIBANK_SANDBOX

    // Verificar se as credenciais parecem reais ou são de exemplo
    const isRealClientId =
      clientId && !clientId.includes("exemplo") && !clientId.includes("test") && clientId.length > 20
    const isRealClientSecret =
      clientSecret && !clientSecret.includes("exemplo") && !clientSecret.includes("test") && clientSecret.length > 30
    const isRealPixKey = pixKey && (pixKey.includes("@") || pixKey.length === 11 || pixKey.length === 14)

    console.log("🔍 Analisando credenciais...")
    console.log("Client ID válido:", isRealClientId)
    console.log("Client Secret válido:", isRealClientSecret)
    console.log("PIX Key válida:", isRealPixKey)

    // Teste básico de conectividade (sem autenticação)
    let connectivityTest = null
    try {
      const testResponse = await fetch("https://pix-h.api.efipay.com.br/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "client_credentials",
        }),
      })

      connectivityTest = {
        status: testResponse.status,
        reachable: true,
      }
    } catch (error) {
      connectivityTest = {
        status: "ERRO",
        reachable: false,
        error: error.message,
      }
    }

    return NextResponse.json({
      credentialsAnalysis: {
        clientId: {
          exists: !!clientId,
          length: clientId?.length || 0,
          seemsReal: isRealClientId,
          preview: clientId ? `${clientId.substring(0, 10)}...` : "N/A",
        },
        clientSecret: {
          exists: !!clientSecret,
          length: clientSecret?.length || 0,
          seemsReal: isRealClientSecret,
          preview: clientSecret ? `${clientSecret.substring(0, 10)}...` : "N/A",
        },
        pixKey: {
          exists: !!pixKey,
          length: pixKey?.length || 0,
          seemsReal: isRealPixKey,
          preview: pixKey ? `${pixKey.substring(0, 5)}...` : "N/A",
        },
        sandbox: sandbox === "true",
      },
      connectivityTest,
      recommendation:
        !isRealClientId || !isRealClientSecret
          ? "⚠️ As credenciais parecem ser de exemplo. Você precisa de credenciais reais da EfiBank."
          : "✅ As credenciais parecem ser reais. O problema pode ser de conectividade.",
    })
  } catch (error) {
    console.error("❌ Erro no debug:", error)
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
