import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("🔍 Carregando produtos...")

    // Primeiro, verificar se a tabela products existe
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      )
    `

    console.log("📋 Tabela products existe:", tableExists[0]?.exists)

    if (!tableExists[0]?.exists) {
      console.log("⚠️ Tabela products não existe")
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        message: "Tabela products não existe",
      })
    }

    // Verificar quais colunas existem na tabela
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND table_schema = 'public'
    `

    const columnNames = columns.map((c) => c.column_name)
    console.log("📋 Colunas disponíveis:", columnNames)

    // Executar query simples primeiro para testar
    let products
    try {
      if (columnNames.includes("nome")) {
        // Se tem colunas em português
        products = await sql`
          SELECT 
            id,
            nome,
            descricao,
            categoria,
            preco,
            logo_url,
            status,
            user_id,
            slug,
            personalizacao_checkout,
            created_at,
            updated_at
          FROM products 
          ORDER BY created_at DESC NULLS LAST
        `
      } else if (columnNames.includes("name")) {
        // Se tem colunas em inglês
        products = await sql`
          SELECT 
            id,
            name,
            description,
            category,
            price,
            logo_url,
            status,
            user_id,
            slug,
            created_at,
            updated_at
          FROM products 
          ORDER BY created_at DESC NULLS LAST
        `
      } else {
        // Fallback - selecionar tudo
        products = await sql`
          SELECT * FROM products 
          ORDER BY id DESC
        `
      }

      console.log(`✅ ${products.length} produtos encontrados`)
      console.log("📋 Primeiro produto (se existir):", products[0])

      // Normalizar dados para o frontend
      const normalizedProducts = products.map((product) => ({
        id: product.id,
        name: product.nome || product.name || "Produto sem nome",
        description: product.descricao || product.description || "Sem descrição",
        category: product.categoria || product.category || "digital",
        price: product.preco || product.price || 0,
        logo_url: product.logo_url || product.image || null,
        status: product.status || "pending",
        user_id: product.user_id,
        slug: product.slug,
        url_checkout: product.url_checkout,
        personalizacao_checkout: product.personalizacao_checkout,
        created_at: product.created_at,
        updated_at: product.updated_at,
        sales: product.sales || 0,
        revenue: product.revenue || 0,
        views: product.views || 0,
      }))

      return NextResponse.json({
        success: true,
        data: normalizedProducts,
        total: normalizedProducts.length,
      })
    } catch (queryError) {
      console.error("❌ Erro na query:", queryError)

      // Tentar query mais simples
      try {
        const simpleProducts = await sql`SELECT * FROM products LIMIT 10`
        console.log("✅ Query simples funcionou, produtos:", simpleProducts.length)

        return NextResponse.json({
          success: true,
          data: simpleProducts,
          total: simpleProducts.length,
        })
      } catch (simpleError) {
        console.error("❌ Erro na query simples:", simpleError)
        return NextResponse.json({
          success: true,
          data: [],
          total: 0,
          message: "Erro ao executar query no banco",
        })
      }
    }
  } catch (error) {
    console.error("❌ Erro ao carregar produtos:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        message: "Erro ao carregar produtos",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 INICIANDO CRIAÇÃO DE PRODUTO...")

    // Ler o body diretamente como JSON
    let body
    try {
      body = await request.json()
      console.log("📋 Dados recebidos:", body)
    } catch (parseError) {
      console.error("❌ Erro no parse JSON:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "JSON inválido",
          message: "Formato de dados inválido",
          details: parseError instanceof Error ? parseError.message : "Erro desconhecido",
        },
        { status: 400 },
      )
    }

    const {
      name,
      description,
      category = "digital",
      price,
      cor_fundo = "#ffffff",
      cor_botao = "#00b894",
      cor_texto = "#000000",
      titulo,
      subtitulo = "",
    } = body

    // VALIDAÇÕES BÁSICAS
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Nome é obrigatório",
          message: "Por favor, insira o nome do produto",
        },
        { status: 400 },
      )
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Descrição é obrigatória",
          message: "Por favor, insira a descrição do produto",
        },
        { status: 400 },
      )
    }

    if (!price || typeof price !== "number" || price <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Preço deve ser maior que zero",
          message: "Por favor, insira um preço válido",
        },
        { status: 400 },
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

    // Verificar se slug já existe e criar um único se necessário
    let finalSlug = slug
    try {
      const existingProduct = await sql`
        SELECT id FROM products WHERE slug = ${slug}
      `
      if (existingProduct.length > 0) {
        finalSlug = `${slug}-${Date.now()}`
      }
    } catch (error) {
      console.log("⚠️ Erro ao verificar slug, usando original")
    }

    // Generate checkout URL
    const checkoutUrl = `/checkout/${finalSlug}`

    // Personalização do checkout
    const personalizacaoCheckout = {
      cor_fundo: cor_fundo || "#ffffff",
      cor_botao: cor_botao || "#00b894",
      cor_texto: cor_texto || "#000000",
      titulo: titulo || name,
      subtitulo: subtitulo || "",
    }

    console.log("💾 Inserindo no banco de dados...")

    // Verificar quais colunas existem antes de inserir
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND table_schema = 'public'
    `

    const columnNames = columns.map((c) => c.column_name)
    console.log("📋 Colunas para inserção:", columnNames)

    // Inserir usando colunas em português (padrão do sistema)
    const result = await sql`
      INSERT INTO products (
        nome, 
        descricao, 
        categoria, 
        preco,
        status,
        slug,
        url_checkout,
        personalizacao_checkout,
        user_id,
        created_at,
        updated_at
      ) VALUES (
        ${name.trim()},
        ${description.trim()},
        ${category},
        ${price},
        'pending',
        ${finalSlug},
        ${checkoutUrl},
        ${JSON.stringify(personalizacaoCheckout)},
        1,
        NOW(),
        NOW()
      )
      RETURNING *
    `

    const product = result[0]

    console.log("✅ PRODUTO CRIADO COM SUCESSO:", product.id)

    return NextResponse.json({
      success: true,
      data: product,
      message: "Produto criado com sucesso! Aguardando aprovação do administrador.",
    })
  } catch (error) {
    console.error("❌ ERRO CRÍTICO:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        message: "Ocorreu um erro inesperado. Tente novamente.",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
