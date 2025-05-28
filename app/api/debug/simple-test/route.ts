import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Testando conexão básica...")

    // Verificar se as variáveis de ambiente existem
    const dbUrl = process.env.DATABASE_URL
    console.log("DATABASE_URL existe:", !!dbUrl)
    console.log("DATABASE_URL (primeiros 20 chars):", dbUrl?.substring(0, 20))

    if (!dbUrl) {
      return NextResponse.json({
        success: false,
        error: "DATABASE_URL não encontrada",
        env: Object.keys(process.env).filter((key) => key.includes("DATABASE") || key.includes("POSTGRES")),
      })
    }

    // Tentar importar e usar o neon
    const { neon } = await import("@neondatabase/serverless")
    const sql = neon(dbUrl)

    console.log("✅ Neon importado com sucesso")

    // Teste de conexão simples
    const result = await sql`SELECT 1 as test`
    console.log("✅ Query de teste executada:", result)

    // Tentar listar tabelas
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    console.log("✅ Tabelas encontradas:", tables)

    return NextResponse.json({
      success: true,
      message: "Conexão funcionando!",
      data: {
        testQuery: result,
        tables: tables.map((t) => t.table_name),
        envVars: Object.keys(process.env).filter((key) => key.includes("DATABASE") || key.includes("POSTGRES")),
      },
    })
  } catch (error) {
    console.error("❌ Erro detalhado:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro na conexão",
        details: {
          message: error instanceof Error ? error.message : "Erro desconhecido",
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
        },
      },
      { status: 500 },
    )
  }
}
