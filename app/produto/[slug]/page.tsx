"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Shield, Star, Play, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  originalPrice: number
  image: string | null
  siteUrl: string
  videoUrl: string
  creator: string
  offers: Array<{
    id: string
    name: string
    price: number
    originalPrice: number
    description: string
    checkoutUrl: string
    isDefault: boolean
  }>
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedOffer, setSelectedOffer] = useState<string>("")

  useEffect(() => {
    fetchProduct()
  }, [params.slug])

  const fetchProduct = async () => {
    try {
      console.log("🔍 Carregando produto:", params.slug)

      // Buscar por slug
      const response = await fetch(`/api/products/by-slug/${params.slug}`)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Produto encontrado:", data.product)
        setProduct(data.product)

        // Selecionar oferta padrão
        const defaultOffer = data.product.offers.find((offer: any) => offer.isDefault)
        if (defaultOffer) {
          setSelectedOffer(defaultOffer.id)
        }
      } else {
        console.error("❌ Produto não encontrado:", response.status)
      }
    } catch (error) {
      console.error("❌ Erro ao carregar produto:", error)
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) {
      return "/placeholder.svg?height=400&width=600&text=Produto"
    }

    // Se já é uma URL completa, usar como está
    if (imageUrl.startsWith("http")) {
      return imageUrl
    }

    // Se é um caminho relativo, garantir que comece com /
    if (!imageUrl.startsWith("/")) {
      return `/${imageUrl}`
    }

    return imageUrl
  }

  const selectedOfferData = product?.offers.find((offer) => offer.id === selectedOffer)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando produto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <p className="text-gray-600 mb-6">O produto que você está procurando não existe ou foi removido.</p>
          <Link href="/">
            <Button>Voltar ao início</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              InfoPlatform
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">Compra Segura</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Imagem do Produto */}
          <div className="space-y-6">
            <div className="relative">
              <img
                src={getImageUrl(product.image) || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  console.log("❌ Erro ao carregar imagem:", product.image)
                  target.src = "/placeholder.svg?height=400&width=600&text=Produto"
                }}
                onLoad={() => {
                  console.log("✅ Imagem carregada:", product.image)
                }}
              />

              {/* Badge de categoria */}
              <Badge className="absolute top-4 left-4 bg-blue-600 text-white">{product.category}</Badge>
            </div>

            {/* Vídeo se disponível */}
            {product.videoUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="h-5 w-5" />
                    <span>Vídeo de Apresentação</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <a
                      href={product.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <Play className="h-6 w-6" />
                      <span>Assistir Vídeo</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{product.description}</p>
              <p className="text-sm text-gray-500 mt-2">Por: {product.creator}</p>
            </div>

            {/* Seleção de Ofertas */}
            <Card>
              <CardHeader>
                <CardTitle>Escolha sua oferta</CardTitle>
                <CardDescription>Selecione a opção que melhor se adequa às suas necessidades</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedOffer === offer.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedOffer(offer.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{offer.name}</h3>
                        <p className="text-sm text-gray-600">{offer.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-green-600">R$ {offer.price.toFixed(2)}</span>
                          {offer.originalPrice > offer.price && (
                            <span className="text-lg text-gray-500 line-through">
                              R$ {offer.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {offer.originalPrice > offer.price && (
                          <Badge className="bg-red-100 text-red-800 mt-1">
                            {Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100)}% OFF
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Benefícios */}
            <Card>
              <CardHeader>
                <CardTitle>✅ O que você vai receber</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    "Acesso vitalício ao conteúdo",
                    "Certificado de conclusão",
                    "Suporte por email",
                    "Atualizações gratuitas",
                    "Garantia de 7 dias",
                    "Bônus exclusivos",
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Depoimentos */}
            <Card>
              <CardHeader>
                <CardTitle>⭐ Depoimentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    name: "Maria Silva",
                    text: "Este produto mudou completamente minha vida! Recomendo para todos.",
                    rating: 5,
                  },
                  {
                    name: "João Santos",
                    text: "Conteúdo de altíssima qualidade. Superou minhas expectativas.",
                    rating: 5,
                  },
                ].map((testimonial, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="italic mb-2">"{testimonial.text}"</p>
                    <p className="font-semibold text-sm">- {testimonial.name}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Botão de Compra */}
            {selectedOfferData && (
              <div className="space-y-4">
                <Link href={`/checkout/${params.slug}/${selectedOffer}`}>
                  <Button className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700">
                    Comprar Agora por R$ {selectedOfferData.price.toFixed(2)}
                  </Button>
                </Link>

                {/* Garantia */}
                <div className="text-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Garantia de 7 dias ou seu dinheiro de volta
                </div>

                {/* Site externo se disponível */}
                {product.siteUrl && (
                  <div className="text-center">
                    <a
                      href={product.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center justify-center space-x-1"
                    >
                      <span>Visitar site oficial</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-gray-900">InfoPlatform</div>
            <p className="text-sm text-gray-600">© 2025 InfoPlatform. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
