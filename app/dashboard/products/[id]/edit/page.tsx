"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Upload, ArrowLeft, Settings, Eye, BarChart3, Palette } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import Link from "next/link"

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: 0,
    originalPrice: 0,
    siteUrl: "",
    videoUrl: "",
    enableAffiliates: true,
    defaultCommission: 30,
  })

  const [productImage, setProductImage] = useState<File | null>(null)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      console.log("Carregando produto ID:", params.id)

      const response = await fetch(`/api/products/${params.id}`)

      if (response.ok) {
        const data = await response.json()
        const product = data.product

        console.log("Produto carregado:", product)

        setFormData({
          name: product.name || "",
          description: product.description || "",
          category: product.category || "",
          price: product.price || 0,
          originalPrice: product.originalPrice || 0,
          siteUrl: product.site_url || "",
          videoUrl: product.video_url || "",
          enableAffiliates: product.enable_affiliates || true,
          defaultCommission: product.default_commission || 30,
        })

        setCurrentImage(product.image)
      } else {
        console.error("Erro ao carregar produto:", response.status)
        toast({
          title: "Erro",
          description: "Produto não encontrado",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar produto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 10MB",
          variant: "destructive",
        })
        return
      }
      setProductImage(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formDataToSend = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString())
      })

      if (productImage) {
        formDataToSend.append("productImage", productImage)
      }

      const response = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Produto atualizado com sucesso!",
          description: "As alterações foram salvas.",
        })
        // Recarregar os dados do produto
        fetchProduct()
      } else {
        toast({
          title: "Erro ao atualizar produto",
          description: data.message || "Erro interno do servidor",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar produto",
        description: "Erro interno do servidor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) {
      return "/placeholder.svg?height=128&width=128&text=Produto"
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Produto</h1>
              <p className="text-gray-600">Configure seu produto: {formData.name}</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Link href={`/dashboard/products/${params.id}/checkout`}>
            <Button className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Editar Checkout</span>
            </Button>
          </Link>
          <Link href={`/produto/${params.id}`} target="_blank">
            <Button variant="outline" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Visualizar</span>
            </Button>
          </Link>
          <Button variant="outline" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Estatísticas</span>
          </Button>
          <Link href={`/dashboard/products/${params.id}/settings`}>
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Dados principais do seu produto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Curso de Marketing Digital"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    name="category"
                    placeholder="Ex: Cursos, E-books, Software"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Descreva seu produto..."
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="197.00"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Preço Original (R$)</Label>
                  <Input
                    id="originalPrice"
                    name="originalPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="397.00"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        originalPrice: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Link do Site (opcional)</Label>
                  <Input
                    id="siteUrl"
                    name="siteUrl"
                    type="url"
                    placeholder="https://seusite.com"
                    value={formData.siteUrl}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Link do Vídeo (opcional)</Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Image */}
          <Card>
            <CardHeader>
              <CardTitle>Imagem do Produto</CardTitle>
              <CardDescription>Adicione uma imagem para seu produto (JPG/PNG - máx 10MB)</CardDescription>
            </CardHeader>
            <CardContent>
              {currentImage && !productImage && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Imagem atual:</p>
                  <img
                    src={getImageUrl(currentImage) || "/placeholder.svg"}
                    alt="Imagem atual do produto"
                    className="w-32 h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      console.log("❌ Erro ao carregar imagem:", currentImage)
                      target.src = "/placeholder.svg?height=128&width=128&text=Produto"
                    }}
                    onLoad={() => {
                      console.log("✅ Imagem carregada:", currentImage)
                    }}
                  />
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <input
                  id="productImage"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="productImage"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {productImage ? productImage.name : "Clique para enviar uma nova imagem"}
                  </span>
                  {productImage && (
                    <span className="text-xs text-gray-500">{(productImage.size / 1024 / 1024).toFixed(2)} MB</span>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Affiliate Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Afiliados</CardTitle>
              <CardDescription>Configure como os afiliados podem promover seu produto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Permitir Afiliados</Label>
                  <p className="text-sm text-gray-600">Permita que outros usuários promovam seu produto</p>
                </div>
                <Switch
                  checked={formData.enableAffiliates}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableAffiliates: checked })}
                />
              </div>

              {formData.enableAffiliates && (
                <div className="space-y-2">
                  <Label htmlFor="defaultCommission">Comissão Padrão (%)</Label>
                  <Input
                    id="defaultCommission"
                    name="defaultCommission"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="30"
                    value={formData.defaultCommission}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultCommission: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-sm text-gray-600">Porcentagem que os afiliados receberão por cada venda</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link href="/dashboard/products">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
