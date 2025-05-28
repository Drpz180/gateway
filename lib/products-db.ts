import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Helper function to generate a slug from a name
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

const productsDb = {
  getAll: async () => {
    try {
      const products = await sql`
        SELECT * FROM products 
        ORDER BY created_at DESC
      `
      console.log("📋 Total de produtos no DB:", products.length)
      return products
    } catch (error) {
      console.error("❌ Erro ao buscar produtos:", error)
      return []
    }
  },

  getById: async (id: string) => {
    try {
      const products = await sql`
        SELECT * FROM products 
        WHERE id = ${id}
      `
      return products[0] || null
    } catch (error) {
      console.error("❌ Erro ao buscar produto por ID:", error)
      return null
    }
  },

  getBySlug: async (slug: string) => {
    try {
      const products = await sql`
        SELECT * FROM products 
        WHERE slug = ${slug}
      `
      return products[0] || null
    } catch (error) {
      console.error("❌ Erro ao buscar produto por slug:", error)
      return null
    }
  },

  create: async (productData: any) => {
    try {
      const slug = productData.slug || generateSlug(productData.nome)

      const products = await sql`
        INSERT INTO products (
          nome, descricao, preco, categoria, logo_url, slug,
          site_url, video_url, enable_affiliates, default_commission,
          offers, status, user_id, creator, personalizacao_checkout
        ) VALUES (
          ${productData.nome},
          ${productData.descricao},
          ${productData.preco},
          ${productData.categoria || "digital"},
          ${productData.logo_url},
          ${slug},
          ${productData.site_url},
          ${productData.video_url},
          ${productData.enable_affiliates || false},
          ${productData.default_commission || 30},
          ${JSON.stringify(productData.offers || [])},
          'pending',
          ${productData.user_id || 1},
          ${productData.creator || "Usuário"},
          ${JSON.stringify(productData.personalizacao_checkout || {})}
        )
        RETURNING *
      `

      const product = products[0]
      console.log("✅ Produto criado no banco com status PENDING:", product.id)
      return product
    } catch (error) {
      console.error("❌ Erro ao criar produto:", error)
      throw error
    }
  },

  update: async (id: string, productData: any) => {
    try {
      const products = await sql`
        UPDATE products 
        SET 
          nome = COALESCE(${productData.nome}, nome),
          descricao = COALESCE(${productData.descricao}, descricao),
          preco = COALESCE(${productData.preco}, preco),
          categoria = COALESCE(${productData.categoria}, categoria),
          logo_url = COALESCE(${productData.logo_url}, logo_url),
          site_url = COALESCE(${productData.site_url}, site_url),
          video_url = COALESCE(${productData.video_url}, video_url),
          enable_affiliates = COALESCE(${productData.enable_affiliates}, enable_affiliates),
          default_commission = COALESCE(${productData.default_commission}, default_commission),
          offers = COALESCE(${JSON.stringify(productData.offers)}, offers),
          personalizacao_checkout = COALESCE(${JSON.stringify(productData.personalizacao_checkout)}, personalizacao_checkout),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `
      return products[0] || null
    } catch (error) {
      console.error("❌ Erro ao atualizar produto:", error)
      return null
    }
  },

  delete: async (id: string) => {
    try {
      await sql`
        DELETE FROM products 
        WHERE id = ${id}
      `
      return true
    } catch (error) {
      console.error("❌ Erro ao deletar produto:", error)
      return false
    }
  },

  approve: async (id: string) => {
    try {
      const products = await sql`
        UPDATE products 
        SET status = 'approved', updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `
      const product = products[0]
      if (product) {
        console.log("✅ Produto aprovado no banco:", id)
      }
      return product || null
    } catch (error) {
      console.error("❌ Erro ao aprovar produto:", error)
      return null
    }
  },

  reject: async (id: string) => {
    try {
      const products = await sql`
        UPDATE products 
        SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `
      const product = products[0]
      if (product) {
        console.log("✅ Produto rejeitado no banco:", id)
      }
      return product || null
    } catch (error) {
      console.error("❌ Erro ao rejeitar produto:", error)
      return null
    }
  },

  // Métodos para filtrar por status
  getPending: async () => {
    try {
      const products = await sql`
        SELECT * FROM products 
        WHERE status = 'pending'
        ORDER BY created_at DESC
      `
      return products
    } catch (error) {
      console.error("❌ Erro ao buscar produtos pendentes:", error)
      return []
    }
  },

  getApproved: async () => {
    try {
      const products = await sql`
        SELECT * FROM products 
        WHERE status = 'approved'
        ORDER BY created_at DESC
      `
      return products
    } catch (error) {
      console.error("❌ Erro ao buscar produtos aprovados:", error)
      return []
    }
  },

  getRejected: async () => {
    try {
      const products = await sql`
        SELECT * FROM products 
        WHERE status = 'rejected'
        ORDER BY created_at DESC
      `
      return products
    } catch (error) {
      console.error("❌ Erro ao buscar produtos rejeitados:", error)
      return []
    }
  },
}

export default productsDb
