import { neon } from "@neondatabase/serverless"
import jwt from "jsonwebtoken"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("🔍 Iniciando verificação completa do sistema...")

    // 1. Verificar Banco de Dados
    let databaseStatus = {
      connected: false,
      host: "",
      database: "",
      tables: [],
      error: null,
    }

    try {
      const dbInfo = await sql`
        SELECT 
          current_database() as database_name,
          inet_server_addr() as host,
          version() as version
      `

      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `

      databaseStatus = {
        connected: true,
        host: process.env.PGHOST || "N/A",
        database: dbInfo[0]?.database_name || "N/A",
        tables: tables.map((t) => t.table_name),
        error: null,
      }

      console.log("✅ Banco de dados conectado:", databaseStatus.database)
    } catch (error) {
      databaseStatus.error = error instanceof Error ? error.message : "Erro desconhecido"
      console.error("❌ Erro no banco:", error)
    }

    // 2. Verificar Variáveis de Ambiente
    const environmentStatus = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      EFIBANK_CLIENT_ID: !!process.env.EFIBANK_CLIENT_ID,
      EFIBANK_CLIENT_SECRET: !!process.env.EFIBANK_CLIENT_SECRET,
      EFIBANK_SANDBOX: !!process.env.EFIBANK_SANDBOX,
      NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL,
      EFIBANK_PIX_KEY: !!process.env.EFIBANK_PIX_KEY,
      EFIBANK_CERTIFICATE_PATH: !!process.env.EFIBANK_CERTIFICATE_PATH,
      NEXT_PUBLIC_STACK_PROJECT_ID: !!process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
      STACK_SECRET_SERVER_KEY: !!process.env.STACK_SECRET_SERVER_KEY,
    }

    console.log("📋 Variáveis verificadas:", Object.keys(environmentStatus).length)

    // 3. Verificar EfiBank
    const efibankStatus = {
      configured: false,
      sandbox: process.env.EFIBANK_SANDBOX === "true",
      clientId: !!process.env.EFIBANK_CLIENT_ID,
      clientSecret: !!process.env.EFIBANK_CLIENT_SECRET,
      pixKey: !!process.env.EFIBANK_PIX_KEY,
      testResult: null,
    }

    efibankStatus.configured = efibankStatus.clientId && efibankStatus.clientSecret && efibankStatus.pixKey

    // Teste básico do EfiBank (sem fazer chamada real)
    if (efibankStatus.configured) {
      efibankStatus.testResult = {
        success: true,
        message: "Credenciais configuradas (teste real não executado)",
      }
    } else {
      efibankStatus.testResult = {
        success: false,
        message: "Credenciais incompletas",
      }
    }

    console.log("💳 EfiBank configurado:", efibankStatus.configured)

    // 4. Verificar JWT
    const jwtStatus = {
      configured: !!process.env.JWT_SECRET,
      testResult: null,
    }

    if (jwtStatus.configured) {
      try {
        // Teste de criação e verificação de token
        const testPayload = { userId: "test", role: "user" }
        const token = jwt.sign(testPayload, process.env.JWT_SECRET!, { expiresIn: "1h" })
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)

        jwtStatus.testResult = {
          success: true,
          message: "JWT funcionando corretamente",
        }
        console.log("🔑 JWT testado com sucesso")
      } catch (error) {
        jwtStatus.testResult = {
          success: false,
          message: "Erro ao testar JWT: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        }
        console.error("❌ Erro no JWT:", error)
      }
    } else {
      jwtStatus.testResult = {
        success: false,
        message: "JWT_SECRET não configurado",
      }
    }

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      database: databaseStatus,
      environment: environmentStatus,
      efibank: efibankStatus,
      jwt: jwtStatus,
    }

    console.log("✅ Verificação do sistema concluída")

    return Response.json(response)
  } catch (error) {
    console.error("❌ Erro na verificação do sistema:", error)

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
