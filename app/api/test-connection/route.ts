import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("🔍 Testando conexão com banco da conta anterior...")

    // Testar conexão básica
    const result = await sql`SELECT NOW() as current_time`

    // Verificar se as tabelas existem
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    console.log(
      "📋 Tabelas encontradas:",
      tables.map((t) => t.table_name),
    )

    // Verificar dados existentes
    let userData = []
    let productData = []

    try {
      userData = await sql`SELECT id, email, name, role FROM users LIMIT 5`
    } catch (error) {
      console.log("⚠️ Tabela users não encontrada ou erro:", error)
    }

    try {
      productData = await sql`SELECT id, name, price, status FROM products LIMIT 5`
    } catch (error) {
      console.log("⚠️ Tabela products não encontrada ou erro:", error)
    }

    return Response.json({
      success: true,
      message: "Conexão estabelecida com sucesso!",
      data: {
        currentTime: result[0].current_time,
        tables: tables.map((t) => t.table_name),
        sampleData: {
          users: userData,
          products: productData,
        },
        counts: {
          tables: tables.length,
          users: userData.length,
          products: productData.length,
        },
      },
    })
  } catch (error) {
    console.error("❌ Erro na conexão:", error)

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        message: "Falha na conexão com o banco",
        details: {
          databaseUrl: process.env.DATABASE_URL ? "Configurada" : "Não configurada",
        },
      },
      { status: 500 },
    )
  }
}
