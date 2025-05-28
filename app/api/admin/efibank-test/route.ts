import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Iniciando teste EfiBank...")

    // Verificar configurações básicas
    const details = {
      "Client ID": !!process.env.EFIBANK_CLIENT_ID,
      "Client Secret": !!process.env.EFIBANK_CLIENT_SECRET,
      "PIX Key": !!process.env.EFIBANK_PIX_KEY,
      Sandbox: process.env.EFIBANK_SANDBOX === "true",
      "Certificado Base64": !!process.env.EFIBANK_CERTIFICATE_BASE64,
      "Certificado Arquivo": !!process.env.EFIBANK_CERTIFICATE_PATH,
    }

    console.log("📋 Configurações:", details)

    // Verificar se as credenciais básicas estão configuradas
    if (!process.env.EFIBANK_CLIENT_ID || !process.env.EFIBANK_CLIENT_SECRET || !process.env.EFIBANK_PIX_KEY) {
      return NextResponse.json({
        success: false,
        message: "Credenciais EfiBank não configuradas completamente",
        details,
      })
    }

    // Tentar fazer uma requisição manual para debug
    const clientId = process.env.EFIBANK_CLIENT_ID
    const clientSecret = process.env.EFIBANK_CLIENT_SECRET
    const sandbox = process.env.EFIBANK_SANDBOX === "true"

    const baseUrl = sandbox ? "https://pix-h.api.efipay.com.br" : "https://pix.api.efipay.com.br"

    console.log("🔗 URL base:", baseUrl)
    console.log("🔑 Tentando autenticação...")

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const response = await fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
      }),
    })

    console.log("📡 Status da resposta:", response.status)
    console.log("📡 Headers da resposta:", Object.fromEntries(response.headers.entries()))

    // Verificar se a resposta é JSON
    const contentType = response.headers.get("content-type")
    console.log("📄 Content-Type:", contentType)

    // Ler a resposta como texto primeiro
    const responseText = await response.text()
    console.log("📄 Resposta bruta (primeiros 500 chars):", responseText.substring(0, 500))

    if (!response.ok) {
      console.error("❌ Resposta de erro:", responseText)

      return NextResponse.json({
        success: false,
        message: `Erro HTTP ${response.status}`,
        details: {
          ...details,
          "Status HTTP": response.status,
          "Content-Type": contentType,
          Resposta: responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""),
          URL: baseUrl,
        },
      })
    }

    // Tentar fazer parse do JSON
    let tokenData
    try {
      tokenData = JSON.parse(responseText)
      console.log("✅ Token obtido com sucesso!")
    } catch (parseError) {
      console.error("❌ Erro ao fazer parse do JSON:", parseError)

      return NextResponse.json({
        success: false,
        message: "Resposta da API não é JSON válido",
        details: {
          ...details,
          "Parse Error": parseError.message,
          Resposta: responseText.substring(0, 500),
          "Content-Type": contentType,
          URL: baseUrl,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Conexão com EfiBank funcionando! Token obtido com sucesso.",
      details: {
        ...details,
        "Token Obtido": true,
        Ambiente: sandbox ? "Sandbox" : "Produção",
        URL: baseUrl,
        "Content-Type": contentType,
        "Token Type": tokenData.token_type || "N/A",
        "Expires In": tokenData.expires_in || "N/A",
      },
    })
  } catch (error) {
    console.error("❌ Erro geral no teste EfiBank:", error)

    // Retornar erro detalhado
    return NextResponse.json(
      {
        success: false,
        message: `Erro interno: ${error.message}`,
        details: {
          Erro: error.message,
          "Tipo do Erro": error.constructor.name,
          Stack: error.stack?.substring(0, 500),
        },
      },
      { status: 500 },
    )
  }
}
