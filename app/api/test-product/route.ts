import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("🔍 Buscando produto de teste...")

    // Primeiro, tentar encontrar um produto existente
    const existingProducts = await sql`
      SELECT id, nome as name, preco as price, status 
      FROM products 
      WHERE status = 'approved'
      LIMIT 1
    `

    if (existingProducts.length > 0) {
      console.log("✅ Produto existente encontrado:", existingProducts[0])
      return NextResponse.json({
        success: true,
        product: existingProducts[0],
        message: "Produto existente encontrado",
      })
    }

    // Se não encontrar, criar um produto de teste
    console.log("📦 Criando produto de teste...")

    // Primeiro, verificar se existe um usuário
    const users = await sql`SELECT id FROM users LIMIT 1`
    let userId = 1

    if (users.length === 0) {
      // Criar usuário de teste
      const newUser = await sql`
        INSERT INTO users (name, email, password, role, status)
        VALUES ('Usuário Teste', 'teste@infoplataforma.com', 'hashed_password', 'seller', 'active')
        RETURNING id
      `
      userId = newUser[0].id
      console.log("👤 Usuário de teste criado:", userId)
    } else {
      userId = users[0].id
    }

    // Criar produto de teste
    const newProduct = await sql`
      INSERT INTO products (
        nome, descricao, preco, categoria, user_id, status,
        imagem_url, created_at, updated_at
      ) VALUES (
        'SmartX - Produto de Teste',
        'Produto criado automaticamente para testes de PIX',
        67.90,
        'digital',
        ${userId},
        'approved',
        '/placeholder-product.png',
        NOW(),
        NOW()
      ) RETURNING id, nome as name, preco as price, status
    `

    console.log("✅ Produto de teste criado:", newProduct[0])

    return NextResponse.json({
      success: true,
      product: newProduct[0],
      message: "Produto de teste criado com sucesso",
      created: true,
    })
  } catch (error) {
    console.error("❌ Erro ao buscar/criar produto de teste:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao buscar/criar produto de teste",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
