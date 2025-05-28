import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("🔍 Verificando estrutura do banco...")

    // Verificar quais tabelas existem
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    console.log("📋 Tabelas encontradas:", tables)

    // Verificar estrutura da tabela products se existir
    let productsStructure = null
    try {
      productsStructure = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'products' AND table_schema = 'public'
        ORDER BY ordinal_position
      `
    } catch (error) {
      console.log("⚠️ Tabela products não existe")
    }

    // Verificar se há dados na tabela products
    let productsData = null
    let productsCount = 0
    try {
      const countResult = await sql`SELECT COUNT(*) as count FROM products`
      productsCount = countResult[0]?.count || 0

      if (productsCount > 0) {
        productsData = await sql`SELECT * FROM products LIMIT 3`
      }
    } catch (error) {
      console.log("⚠️ Erro ao contar produtos:", error)
    }

    // Verificar estrutura da tabela users se existir
    let usersStructure = null
    try {
      usersStructure = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public'
        ORDER BY ordinal_position
      `
    } catch (error) {
      console.log("⚠️ Tabela users não existe")
    }

    return NextResponse.json({
      success: true,
      data: {
        tables: tables.map((t) => t.table_name),
        products: {
          structure: productsStructure,
          count: productsCount,
          sampleData: productsData,
        },
        users: {
          structure: usersStructure,
        },
      },
    })
  } catch (error) {
    console.error("❌ Erro ao verificar estrutura:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao verificar estrutura do banco",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
