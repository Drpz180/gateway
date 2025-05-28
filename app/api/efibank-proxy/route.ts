import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Configurações
    const clientId = process.env.EFIBANK_CLIENT_ID
    const clientSecret = process.env.EFIBANK_CLIENT_SECRET
    const sandbox = process.env.EFIBANK_SANDBOX === "true"

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Credenciais não configuradas",
        },
        { status: 400 },
      )
    }

    // Usar um serviço proxy se a conexão direta falhar
    const baseUrl = sandbox ? "https://pix-h.api.efipay.com.br" : "https://pix.api.efipay.com.br"

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    // Tentar com configurações específicas para Vercel
    const response = await fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "User-Agent": "InfoPlatform/1.0",
        Accept: "application/json",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
      }),
      // Configurações específicas para Vercel
      signal: AbortSignal.timeout(30000), // 30 segundos
    })

    const responseText = await response.text()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: `Erro HTTP ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText.substring(0, 1000),
        },
      })
    }

    try {
      const tokenData = JSON.parse(responseText)
      return NextResponse.json({
        success: true,
        message: "Token obtido com sucesso!",
        data: {
          token_type: tokenData.token_type,
          expires_in: tokenData.expires_in,
          // Não retornar o token real por segurança
          has_access_token: !!tokenData.access_token,
        },
      })
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        message: "Resposta não é JSON válido",
        details: {
          parseError: parseError.message,
          response: responseText.substring(0, 500),
        },
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Erro de conexão: ${error.message}`,
        details: {
          errorType: error.constructor.name,
          errorMessage: error.message,
        },
      },
      { status: 500 },
    )
  }
}
