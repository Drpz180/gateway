"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AdminLayout from "@/components/layouts/AdminLayout"
import Link from "next/link"

export default function AdminEditProductPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    preco: 0,
    site_url: "",
    video_url: "",
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
      const response = await fetch(`/api/products/${params.id}`)

      if (response.ok) {
        const data = await response.json()
        const product = data.data

        setFormData({
          nome: product.nome || "",
          descricao: product.descricao || "",
          categoria: product.categoria || "",
          preco: product.preco || 0,
          site_url: product.site_url || "",
          video_url: product.video_url || "",
        })

        setCurrentImage(product.logo_url)
      } else {
        toast({
          title: "Erro",
          description: "Produto não encontrado",
          variant: "destructive",
        })
      }
    } catch (error) {
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
        formDataToSend.append("logo", productImage)
      }

      const response = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        body: formDataToSend,
      })

      if (response.ok) {
        toast({
          title: "Produto atualizado!",
          description: "As alterações foram salvas com sucesso.",
        })
        router.push("/admin/products")
      } else {
        toast({
          title: "Erro",
          description: "Erro ao atualizar produto",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Produto</h1>
            <p className="text-gray-600">Edite as informações do produto</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Produto</CardTitle>
              <CardDescription>Edite os dados principais do produto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto</Label>
                  <Input id="nome" name="nome" value={formData.nome} onChange={handleInputChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  rows={4}
                  value={formData.descricao}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    name="preco"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preco: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site_url">Site URL</Label>
                  <Input
                    id="site_url"
                    name="site_url"
                    type="url"
                    value={formData.site_url}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video_url">Vídeo URL</Label>
                  <Input
                    id="video_url"
                    name="video_url"
                    type="url"
                    value={formData.video_url}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Imagem do Produto</CardTitle>
              <CardDescription>Atualize a imagem do produto</CardDescription>
            </CardHeader>
            <CardContent>
              {currentImage && !productImage && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Imagem atual:</p>
                  <img
                    src={currentImage || "/placeholder.svg"}
                    alt="Imagem atual"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <input id="logo" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <label htmlFor="logo" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {productImage ? productImage.name : "Clique para enviar nova imagem"}
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Link href="/admin/products">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
