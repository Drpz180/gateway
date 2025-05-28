import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("🔍 Testando conexão com banco...")

    // Testar conexão básica
    const result = await sql`SELECT NOW() as current_time, version() as db_version`

    // Verificar se as tabelas existem
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    // Contar registros nas principais tabelas
    const userCount = await sql`SELECT COUNT(*) as count FROM users`
    const productCount = await sql`SELECT COUNT(*) as count FROM products`

    return Response.json({
      success: true,
      message: "Conexão com banco estabelecida!",
      data: {
        currentTime: result[0].current_time,
        dbVersion: result[0].db_version,
        tables: tables.map((t) => t.table_name),
        counts: {
          users: userCount[0].count,
          products: productCount[0].count,
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
      },
      { status: 500 },
    )
  }
}
