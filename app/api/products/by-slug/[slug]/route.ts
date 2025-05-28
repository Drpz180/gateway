import { type NextRequest, NextResponse } from "next/server"
import { ProductDB } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    console.log("🔍 Buscando produto por slug:", params.slug)

    const product = ProductDB.findBySlug(params.slug)

    if (!product) {
      console.log("❌ Produto não encontrado para slug:", params.slug)
      return NextResponse.json({ message: "Produto não encontrado" }, { status: 404 })
    }

    console.log("✅ Produto encontrado:", product.name)

    // Retornar dados do produto com ofertas
    const productData = {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice,
      siteUrl: product.siteUrl,
      videoUrl: product.videoUrl,
      creator: product.creator,
      image: product.image,
      status: product.status,
      offers: product.offers.map((offer) => ({
        id: offer.id,
        name: offer.name,
        price: offer.price,
        originalPrice: offer.originalPrice,
        description: offer.description,
        checkoutUrl: offer.checkoutUrl,
        isDefault: offer.isDefault,
      })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }

    return NextResponse.json({ product: productData })
  } catch (error) {
    console.error("❌ Erro ao buscar produto:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
