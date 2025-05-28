"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Upload, Plus, Trash2, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import Link from "next/link"

interface Offer {
  id: string
  name: string
  price: number
  description: string
}

export default function NewProductPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    siteUrl: "",
    videoUrl: "",
    enableAffiliates: true,
    defaultCommission: 30,
  })

  const [offers, setOffers] = useState<Offer[]>([{ id: "1", name: "Oferta Principal", price: 0, description: "" }])

  const [productImage, setProductImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Limitar tamanhos dos campos
    let limitedValue = value
    if (name === "name" && value.length > 200) {
      limitedValue = value.substring(0, 200)
    } else if (name === "description" && value.length > 5000) {
      limitedValue = value.substring(0, 5000)
    } else if (name === "category" && value.length > 100) {
      limitedValue = value.substring(0, 100)
    } else if ((name === "siteUrl" || name === "videoUrl") && value.length > 500) {
      limitedValue = value.substring(0, 500)
    }

    setFormData({
      ...formData,
      [name]: limitedValue,
    })
  }

  const handleOfferChange = (id: string, field: string, value: string | number) => {
    let limitedValue = value

    // Limitar tamanhos dos campos das ofertas
    if (field === "name" && typeof value === "string" && value.length > 200) {
      limitedValue = value.substring(0, 200)
    } else if (field === "description" && typeof value === "string" && value.length > 1000) {
      limitedValue = value.substring(0, 1000)
    }

    setOffers(offers.map((offer) => (offer.id === id ? { ...offer, [field]: limitedValue } : offer)))
  }

  const addOffer = () => {
    const newOffer: Offer = {
      id: Date.now().toString(),
      name: `Oferta ${offers.length + 1}`,
      price: 0,
      description: "",
    }
    setOffers([...offers, newOffer])
  }

  const removeOffer = (id: string) => {
    if (offers.length > 1) {
      setOffers(offers.filter((offer) => offer.id !== id))
    }
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
      console.log("=== INICIANDO ENVIO ===")

      // Validações
      if (!formData.name.trim()) {
        toast({
          title: "Nome obrigatório",
          description: "Por favor, insira o nome do produto",
          variant: "destructive",
        })
        return
      }

      if (!formData.description.trim()) {
        toast({
          title: "Descrição obrigatória",
          description: "Por favor, insira a descrição do produto",
          variant: "destructive",
        })
        return
      }

      if (offers.length === 0) {
        toast({
          title: "Oferta obrigatória",
          description: "Por favor, adicione pelo menos uma oferta",
          variant: "destructive",
        })
        return
      }

      // Validar ofertas
      for (const offer of offers) {
        if (!offer.name.trim()) {
          toast({
            title: "Nome da oferta obrigatório",
            description: "Todas as ofertas devem ter um nome",
            variant: "destructive",
          })
          return
        }
      }

      const formDataToSend = new FormData()

      // Adicionar campos com validação
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString())
      })

      // Adicionar ofertas
      formDataToSend.append("offers", JSON.stringify(offers))

      // Adicionar imagem
      if (productImage) {
        formDataToSend.append("productImage", productImage)
      }

      console.log("Enviando requisição...")
      const response = await fetch("/api/products", {
        method: "POST",
        body: formDataToSend,
      })

      console.log("Status:", response.status)
      console.log("Content-Type:", response.headers.get("content-type"))

      let data: any
      const responseText = await response.text()
      console.log("Resposta (primeiros 200 chars):", responseText.substring(0, 200))

      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Erro ao fazer parse:", parseError)
        throw new Error(`Resposta inválida do servidor: ${responseText.substring(0, 100)}`)
      }

      if (response.ok && data.success) {
        toast({
          title: "Produto criado com sucesso!",
          description: data.message,
        })
        router.push("/dashboard/products")
      } else {
        toast({
          title: "Erro ao criar produto",
          description: data.message || "Erro interno do servidor",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "Erro ao criar produto",
        description: error instanceof Error ? error.message : "Erro de conexão",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Novo Produto</h1>
            <p className="text-gray-600">Crie um novo produto para sua loja</p>
          </div>
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
                  <Label htmlFor="name">Nome do Produto * ({formData.name.length}/200)</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Curso de Marketing Digital"
                    value={formData.name}
                    onChange={handleInputChange}
                    maxLength={200}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria ({formData.category.length}/100)</Label>
                  <Input
                    id="category"
                    name="category"
                    placeholder="Ex: Cursos, E-books, Software"
                    value={formData.category}
                    onChange={handleInputChange}
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição * ({formData.description.length}/5000)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Descreva seu produto..."
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={5000}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Link do Site ({formData.siteUrl.length}/500)</Label>
                  <Input
                    id="siteUrl"
                    name="siteUrl"
                    type="url"
                    placeholder="https://seusite.com"
                    value={formData.siteUrl}
                    onChange={handleInputChange}
                    maxLength={500}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Link do Vídeo ({formData.videoUrl.length}/500)</Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    maxLength={500}
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
                    {productImage ? productImage.name : "Clique para enviar uma imagem"}
                  </span>
                  {productImage && (
                    <span className="text-xs text-gray-500">{(productImage.size / 1024 / 1024).toFixed(2)} MB</span>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Offers */}
          <Card>
            <CardHeader>
              <CardTitle>Ofertas e Preços</CardTitle>
              <CardDescription>Configure os preços e ofertas do seu produto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {offers.map((offer, index) => (
                <div key={offer.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Oferta {index + 1}</Badge>
                    {offers.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeOffer(offer.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome da Oferta * ({offer.name.length}/200)</Label>
                      <Input
                        placeholder="Ex: Oferta Básica"
                        value={offer.name}
                        onChange={(e) => handleOfferChange(offer.id, "name", e.target.value)}
                        maxLength={200}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Preço (R$) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={offer.price}
                        onChange={(e) => handleOfferChange(offer.id, "price", Number.parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição da Oferta ({offer.description.length}/1000)</Label>
                    <Textarea
                      placeholder="Descreva o que está incluído nesta oferta..."
                      rows={2}
                      value={offer.description}
                      onChange={(e) => handleOfferChange(offer.id, "description", e.target.value)}
                      maxLength={1000}
                    />
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addOffer} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Nova Oferta
              </Button>
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
              <Button variant="outline" disabled={isLoading}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Produto"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
