import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Testando credenciais da EFI Pay...")

    // Verificar se as variáveis de ambiente estão configuradas
    const envVars = {
      PIX_CLIENT_ID: !!process.env.PIX_CLIENT_ID,
      PIX_SECRET_KEY: !!process.env.PIX_SECRET_KEY,
      PIX_BASE_URL: process.env.PIX_BASE_URL || "https://pix.api.efipay.com.br",
      PIX_CERTIFICADO: !!process.env.PIX_CERTIFICADO,
      PIX_KEY: !!process.env.PIX_KEY,
    }

    console.log("📋 Variáveis de ambiente:", envVars)

    // Verificar se todas as variáveis necessárias estão configuradas
    if (
      !process.env.PIX_CLIENT_ID ||
      !process.env.PIX_SECRET_KEY ||
      !process.env.PIX_CERTIFICADO ||
      !process.env.PIX_KEY
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Algumas variáveis de ambiente não estão configuradas",
          envVars,
        },
        { status: 400 },
      )
    }

    // Tentar obter token de forma simplificada
    const clientId = process.env.PIX_CLIENT_ID
    const clientSecret = process.env.PIX_SECRET_KEY
    const baseUrl = process.env.PIX_BASE_URL || "https://pix.api.efipay.com.br"

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    console.log("🔑 Tentando obter token...")
    console.log("🌐 URL:", `${baseUrl}/oauth/token`)

    const response = await fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        "User-Agent": "NodeJS-EfiPay-SDK",
        Accept: "application/json",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
      }),
    })

    console.log("📡 Status da resposta:", response.status)
    console.log("📋 Headers da resposta:", Object.fromEntries(response.headers.entries()))

    // Verificar o content-type da resposta
    const contentType = response.headers.get("content-type")
    console.log("📄 Content-Type:", contentType)

    // Ler a resposta como texto primeiro
    const responseText = await response.text()
    console.log("📝 Resposta (primeiros 500 chars):", responseText.substring(0, 500))

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `Erro HTTP ${response.status}: ${responseText}`,
          status: response.status,
          contentType,
          envVars,
        },
        { status: 200 }, // Retornar 200 para não dar erro no frontend
      )
    }

    // Tentar parsear como JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          message: "Resposta não é JSON válido",
          responseText: responseText.substring(0, 200),
          parseError: parseError instanceof Error ? parseError.message : String(parseError),
          envVars,
        },
        { status: 200 },
      )
    }

    console.log("✅ Token obtido com sucesso!")

    return NextResponse.json({
      success: true,
      message: "Credenciais válidas! Token obtido com sucesso.",
      tokenObtido: !!data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      envVars,
    })
  } catch (error) {
    console.error("❌ Erro ao testar credenciais:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Erro interno ao validar credenciais",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 200 }, // Retornar 200 para não dar erro no frontend
    )
  }
}
