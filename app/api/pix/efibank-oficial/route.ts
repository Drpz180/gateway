import { NextResponse } from "next/server"

// Função auxiliar para logs seguros
function safeLog(message: string, data?: any) {
  try {
    console.log(message, data ? JSON.stringify(data, null, 2) : "")
  } catch (error) {
    console.log(message, "[Erro ao serializar dados]")
  }
}

// Função para criar resposta JSON segura
function createSafeResponse(data: any, status = 200) {
  try {
    return NextResponse.json(data, { status })
  } catch (error) {
    console.error("❌ Erro ao criar resposta JSON:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
        error: "Erro ao serializar resposta",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    safeLog("🔍 [OFICIAL] Iniciando teste de credenciais...")

    // Verificar variáveis de ambiente primeiro
    const envVars = {
      PIX_CLIENT_ID: process.env.PIX_CLIENT_ID || "",
      PIX_SECRET_KEY: process.env.PIX_SECRET_KEY || "",
      PIX_CERTIFICADO: process.env.PIX_CERTIFICADO || "",
      PIX_KEY: process.env.PIX_KEY || "",
      PIX_BASE_URL: process.env.PIX_BASE_URL || "",
    }

    const config = {
      clientId: !!envVars.PIX_CLIENT_ID,
      clientSecret: !!envVars.PIX_SECRET_KEY,
      certificate: !!envVars.PIX_CERTIFICADO,
      pixKey: !!envVars.PIX_KEY,
      sandbox: envVars.PIX_BASE_URL?.includes("pix-h") || false,
      baseUrl: envVars.PIX_BASE_URL?.includes("pix-h")
        ? "https://pix-h.api.efipay.com.br"
        : "https://pix.api.efipay.com.br",
    }

    safeLog("📋 Configuração detectada:", config)

    // Verificar campos obrigatórios (sandbox não é obrigatório)
    const requiredFields = {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      pixKey: config.pixKey,
      // Para produção, certificado é obrigatório. Para sandbox, não.
      certificate: config.sandbox ? true : config.certificate,
    }

    const missing = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key)

    if (missing.length > 0) {
      return createSafeResponse({
        success: false,
        message: "Credenciais obrigatórias não configuradas",
        config,
        missing,
        note: config.sandbox
          ? "Modo sandbox: certificado não é obrigatório"
          : "Modo produção: certificado é obrigatório",
      })
    }

    // Tentar obter token
    try {
      safeLog("🔑 Tentando obter token...")

      const credentials = Buffer.from(`${envVars.PIX_CLIENT_ID}:${envVars.PIX_SECRET_KEY}`).toString("base64")

      const response = await fetch(`${config.baseUrl}/oauth/token`, {
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

      safeLog("📊 Resposta da EfiBank:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      })

      if (!response.ok) {
        const errorText = await response.text()
        safeLog("❌ Erro da EfiBank:", errorText)

        return createSafeResponse({
          success: false,
          message: "Erro ao obter token da EfiBank",
          config,
          error: errorText,
          status: response.status,
          details: {
            type: "efibank_error",
            suggestion:
              response.status === 401
                ? "Credenciais inválidas - verifique Client ID e Client Secret"
                : response.status === 403
                  ? "Acesso negado - verifique se a conta está ativa"
                  : "Erro na EfiBank - verifique a conectividade",
          },
        })
      }

      const tokenData = await response.json()
      safeLog("✅ Token obtido com sucesso")

      return createSafeResponse({
        success: true,
        message: "🎉 Credenciais válidas! Token EfiBank obtido com sucesso.",
        config,
        tokenObtained: !!tokenData.access_token,
        environment: config.sandbox ? "sandbox" : "production",
      })
    } catch (fetchError: any) {
      safeLog("❌ Erro de conectividade:", fetchError.message)

      return createSafeResponse({
        success: false,
        message: "Erro de conectividade com a EfiBank",
        config,
        error: fetchError.message,
        details: {
          type: "connectivity_error",
          suggestion:
            "A Vercel pode estar bloqueando conexões para a EfiBank. Considere usar webhooks ou proxy externo.",
        },
      })
    }
  } catch (generalError: any) {
    safeLog("❌ Erro geral:", generalError.message)

    return createSafeResponse({
      success: false,
      message: "Erro interno do servidor",
      error: generalError.message,
      details: {
        type: "server_error",
        suggestion: "Erro interno na API",
      },
    })
  }
}

export async function POST(request: Request) {
  try {
    safeLog("🚀 [OFICIAL] Iniciando criação de PIX...")

    const body = await request.json()
    const { name, cpf, amount, description } = body

    // Validar dados
    if (!name || !cpf || !amount) {
      return createSafeResponse({ success: false, message: "Dados incompletos" }, 400)
    }

    const numericAmount = Number.parseFloat(amount.toString().replace(/\./g, "").replace(",", "."))
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return createSafeResponse({ success: false, message: "Valor inválido" }, 400)
    }

    safeLog("📝 Dados validados:", { name, cpf, amount: numericAmount, description })

    // Primeiro verificar se as credenciais funcionam
    const credentialsTest = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/pix/efibank-oficial`,
    )
    const credentialsResult = await credentialsTest.json()

    if (!credentialsResult.success) {
      return createSafeResponse({
        success: false,
        message: "Credenciais EfiBank não funcionam",
        details: credentialsResult,
      })
    }

    // Se chegou até aqui, as credenciais funcionam!
    // Por enquanto retornar mock até implementar a criação completa
    return createSafeResponse({
      success: false,
      message: "Criação de PIX em desenvolvimento",
      note: "Credenciais funcionam! Implementação da criação de PIX em andamento.",
      credentialsWorking: true,
    })
  } catch (error: any) {
    safeLog("❌ Erro ao processar POST:", error.message)

    return createSafeResponse({
      success: false,
      message: "Erro ao processar requisição",
      error: error.message,
    })
  }
}
