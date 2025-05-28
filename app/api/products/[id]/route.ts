import { type NextRequest, NextResponse } from "next/server"
import productsDb from "@/lib/products-db"

// GET - Buscar produto por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🔍 [SERVER] Buscando produto:", params.id)

    const product = await productsDb.getById(params.id)

    if (!product) {
      console.log("❌ [SERVER] Produto não encontrado:", params.id)
      return NextResponse.json(
        {
          success: false,
          error: "Produto não encontrado",
        },
        { status: 404 },
      )
    }

    console.log("✅ [SERVER] Produto encontrado:", product.nome)

    // Função helper para fazer parse seguro de JSON
    const safeJsonParse = (jsonString: any, fallback: any = {}) => {
      if (!jsonString) return fallback
      if (typeof jsonString === "object") return jsonString
      try {
        return JSON.parse(jsonString)
      } catch (error) {
        console.warn("⚠️ Erro ao fazer parse JSON:", error)
        return fallback
      }
    }

    // Mapear os campos do banco para o formato esperado pelo frontend
    const productFormatted = {
      id: product.id,
      name: product.nome || "",
      description: product.descricao || "",
      category: product.categoria || "",
      price: Number(product.preco) || 0,
      originalPrice: Number(product.preco) * 1.5 || 0,
      site_url: product.site_url || "",
      video_url: product.video_url || "",
      enable_affiliates: Boolean(product.enable_affiliates),
      default_commission: Number(product.default_commission) || 30,
      image: product.logo_url || null,
      status: product.status || "pending",
      offers: safeJsonParse(product.offers, []),
      personalizacao_checkout: safeJsonParse(product.personalizacao_checkout, {}),
      created_at: product.created_at,
      updated_at: product.updated_at,
    }

    console.log("✅ [SERVER] Produto formatado com sucesso")

    return NextResponse.json({
      success: true,
      product: productFormatted,
    })
  } catch (error) {
    console.error("❌ [SERVER] Erro ao buscar produto:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

// PUT - Atualizar produto
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("📝 [SERVER] Atualizando produto:", params.id)

    const formData = await request.formData()

    // Verificar se produto existe
    const existingProduct = await productsDb.getById(params.id)
    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: "Produto não encontrado",
        },
        { status: 404 },
      )
    }

    // Extrair dados do formulário
    const name = formData.get("name")?.toString() || existingProduct.nome
    const description = formData.get("description")?.toString() || existingProduct.descricao
    const category = formData.get("category")?.toString() || existingProduct.categoria
    const price = Number.parseFloat(formData.get("price")?.toString() || existingProduct.preco.toString())
    const originalPrice = Number.parseFloat(formData.get("originalPrice")?.toString() || "0")
    const siteUrl = formData.get("siteUrl")?.toString() || existingProduct.site_url
    const videoUrl = formData.get("videoUrl")?.toString() || existingProduct.video_url
    const enableAffiliates = formData.get("enableAffiliates") === "true"
    const defaultCommission = Number.parseInt(formData.get("defaultCommission")?.toString() || "30")

    // Preparar dados para atualização
    const updateData = {
      nome: name,
      descricao: description,
      categoria: category,
      preco: price,
      site_url: siteUrl,
      video_url: videoUrl,
      enable_affiliates: enableAffiliates,
      default_commission: defaultCommission,
      logo_url: existingProduct.logo_url, // Manter logo atual por padrão
    }

    // Processar nova imagem se fornecida
    const productImage = formData.get("productImage") as File | null
    if (productImage && productImage.size > 0) {
      console.log("🖼️ [SERVER] Atualizando imagem:", productImage.name)

      try {
        // Converter para base64
        const bytes = await productImage.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString("base64")
        const mimeType = productImage.type
        const imageUrl = `data:${mimeType};base64,${base64}`

        updateData.logo_url = imageUrl
        console.log("✅ [SERVER] Imagem convertida para base64")
      } catch (logoError) {
        console.error("❌ [SERVER] Erro ao atualizar imagem:", logoError)
        // Continuar com a atualização mesmo se imagem falhar
      }
    }

    const updatedProduct = await productsDb.update(params.id, updateData)

    if (!updatedProduct) {
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao atualizar produto",
        },
        { status: 500 },
      )
    }

    console.log("✅ [SERVER] Produto atualizado com sucesso:", updatedProduct.nome)

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: "Produto atualizado com sucesso!",
    })
  } catch (error) {
    console.error("❌ [SERVER] Erro ao atualizar produto:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

// DELETE - Deletar produto
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🗑️ [SERVER] Deletando produto:", params.id)

    const success = await productsDb.delete(params.id)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Produto não encontrado",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Produto deletado com sucesso!",
    })
  } catch (error) {
    console.error("❌ [SERVER] Erro ao deletar produto:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
