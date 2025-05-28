import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("🔍 Testando nova conexão Neon...")

    // Testar conexão básica
    const result = await sql`SELECT NOW() as current_time, version() as db_version`

    // Verificar se as tabelas existem
    const tables = await sql`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    console.log(
      "📋 Tabelas encontradas:",
      tables.map((t) => t.table_name),
    )

    // Verificar dados existentes se as tabelas existirem
    let userData = []
    let productData = []
    let hasUsers = false
    let hasProducts = false

    try {
      const userCount = await sql`SELECT COUNT(*) as count FROM users`
      hasUsers = true
      if (userCount[0].count > 0) {
        userData = await sql`SELECT id, email, name, role, created_at FROM users LIMIT 5`
      }
    } catch (error) {
      console.log("⚠️ Tabela users não encontrada")
    }

    try {
      const productCount = await sql`SELECT COUNT(*) as count FROM products`
      hasProducts = true
      if (productCount[0].count > 0) {
        productData = await sql`SELECT id, name, category, status, created_at FROM products LIMIT 5`
      }
    } catch (error) {
      console.log("⚠️ Tabela products não encontrada")
    }

    return Response.json({
      success: true,
      message: "✅ Conexão com novo Neon estabelecida com sucesso!",
      data: {
        currentTime: result[0].current_time,
        dbVersion: result[0].db_version,
        tables: tables.map((t) => ({
          name: t.table_name,
          type: t.table_type,
        })),
        sampleData: {
          users: userData,
          products: productData,
        },
        counts: {
          totalTables: tables.length,
          hasUsers,
          hasProducts,
          sampleUsers: userData.length,
          sampleProducts: productData.length,
        },
        environment: {
          databaseUrl: process.env.DATABASE_URL ? "✅ Configurada" : "❌ Não configurada",
          pgHost: process.env.PGHOST ? "✅ Configurada" : "❌ Não configurada",
          pgUser: process.env.PGUSER ? "✅ Configurada" : "❌ Não configurada",
          stackProjectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID ? "✅ Configurada" : "❌ Não configurada",
        },
      },
    })
  } catch (error) {
    console.error("❌ Erro na conexão:", error)

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        message: "❌ Falha na conexão com o novo banco Neon",
        details: {
          databaseUrl: process.env.DATABASE_URL ? "Configurada" : "Não configurada",
          errorType: error instanceof Error ? error.constructor.name : "Unknown",
        },
      },
      { status: 500 },
    )
  }
}
