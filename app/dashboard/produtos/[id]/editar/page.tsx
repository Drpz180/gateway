"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, Palette, Save, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import type { Product } from "@/lib/products-db"

export default function EditarProdutoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [product, setProduct] = useState<Product | null>(null)

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    cor_fundo: "#ffffff",
    cor_botao: "#00b894",
    cor_texto: "#000000",
    titulo: "",
    subtitulo: "",
  })

  useEffect(() => {
    loadProduct()
  }, [params.id])

  const loadProduct = async () => {
    try {
      console.log("📖 Carregando produto:", params.id)
      const response = await fetch(`/api/products/${params.id}`)
      const result = await response.json()

      if (result.success) {
        const prod = result.data
        setProduct(prod)
        setFormData({
          nome: prod.nome,
          descricao: prod.descricao,
          preco: prod.preco.toString(),
          cor_fundo: prod.personalizacao_checkout.cor_fundo,
          cor_botao: prod.personalizacao_checkout.cor_botao,
          cor_texto: prod.personalizacao_checkout.cor_texto,
          titulo: prod.personalizacao_checkout.titulo,
          subtitulo: prod.personalizacao_checkout.subtitulo,
        })

        if (prod.logo_url) {
          setLogoPreview(prod.logo_url)
        }

        console.log("✅ Produto carregado:", prod.nome)
      } else {
        toast({
          title: "Erro",
          description: "Produto não encontrado",
          variant: "destructive",
        })
        router.push("/dashboard/produtos")
      }
    } catch (error) {
      console.error("❌ Erro ao carregar produto:", error)
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive",
      })
      router.push("/dashboard/produtos")
    } finally {
      setLoadingProduct(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Erro",
          description: "Por favor, selecione uma imagem válida (PNG, JPG, etc.)",
          variant: "destructive",
        })
        return
      }

      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive",
        })
        return
      }

      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validações
      if (!formData.nome.trim()) {
        toast({
          title: "Erro",
          description: "Nome do produto é obrigatório",
          variant: "destructive",
        })
        return
      }

      if (!formData.descricao.trim()) {
        toast({
          title: "Erro",
          description: "Descrição do produto é obrigatória",
          variant: "destructive",
        })
        return
      }

      if (!formData.preco || Number.parseFloat(formData.preco) <= 0) {
        toast({
          title: "Erro",
          description: "Preço deve ser maior que zero",
          variant: "destructive",
        })
        return
      }

      // Preparar FormData
      const submitData = new FormData()
      submitData.append("nome", formData.nome)
      submitData.append("descricao", formData.descricao)
      submitData.append("preco", formData.preco)
      submitData.append("cor_fundo", formData.cor_fundo)
      submitData.append("cor_botao", formData.cor_botao)
      submitData.append("cor_texto", formData.cor_texto)
      submitData.append("titulo", formData.titulo)
      submitData.append("subtitulo", formData.subtitulo)

      // Adicionar logo se selecionada
      const logoInput = document.getElementById("logo") as HTMLInputElement
      if (logoInput?.files?.[0]) {
        submitData.append("logo", logoInput.files[0])
      }

      console.log("📤 Atualizando produto...")

      const response = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        body: submitData,
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        })

        // Recarregar dados do produto
        await loadProduct()
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao atualizar produto",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar produto:", error)
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!product) return

    if (!confirm(`Tem certeza que deseja deletar o produto "${product.nome}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        })
        router.push("/dashboard/produtos")
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao deletar produto",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Erro ao deletar produto:", error)
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive",
      })
    }
  }

  if (loadingProduct) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Link href="/dashboard/produtos">
            <Button>Voltar para Produtos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/produtos">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Editar Produto</h1>
            <p className="text-gray-600">Editando: {product.nome}</p>
          </div>
        </div>

        <Button variant="destructive" onClick={handleDelete} className="flex items-center space-x-2">
          <Trash2 className="h-4 w-4" />
          <span>Deletar</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Dados principais do seu produto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  name="nome"
                  placeholder="Ex: Curso de Marketing Digital"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco">Preço (R$) *</Label>
                <Input
                  id="preco"
                  name="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="97.00"
                  value={formData.preco}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                name="descricao"
                placeholder="Descreva seu produto..."
                rows={4}
                value={formData.descricao}
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo do Produto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Logo do Produto</span>
            </CardTitle>
            <CardDescription>Adicione uma logo para seu produto (PNG, JPG - máx 5MB)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input id="logo" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                <label htmlFor="logo" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                  {logoPreview ? (
                    <div className="space-y-2">
                      <img
                        src={logoPreview || "/placeholder.svg"}
                        alt="Preview da logo"
                        className="w-32 h-32 object-contain rounded-lg border"
                      />
                      <p className="text-sm text-gray-600">Clique para alterar</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">Clique para selecionar uma logo</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personalização do Checkout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Personalização do Checkout</span>
            </CardTitle>
            <CardDescription>Configure as cores e textos do seu checkout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título do Checkout</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  placeholder="Título do produto"
                  value={formData.titulo}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitulo">Subtítulo</Label>
                <Input
                  id="subtitulo"
                  name="subtitulo"
                  placeholder="Ex: Transforme sua vida hoje mesmo!"
                  value={formData.subtitulo}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cor_fundo">Cor de Fundo</Label>
                <div className="flex space-x-2">
                  <Input
                    id="cor_fundo"
                    name="cor_fundo"
                    type="color"
                    value={formData.cor_fundo}
                    onChange={handleInputChange}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.cor_fundo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cor_fundo: e.target.value }))}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor_botao">Cor do Botão</Label>
                <div className="flex space-x-2">
                  <Input
                    id="cor_botao"
                    name="cor_botao"
                    type="color"
                    value={formData.cor_botao}
                    onChange={handleInputChange}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.cor_botao}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cor_botao: e.target.value }))}
                    placeholder="#00b894"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor_texto">Cor do Texto</Label>
                <div className="flex space-x-2">
                  <Input
                    id="cor_texto"
                    name="cor_texto"
                    type="color"
                    value={formData.cor_texto}
                    onChange={handleInputChange}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.cor_texto}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cor_texto: e.target.value }))}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Preview do Checkout */}
            <div className="mt-6 p-4 border rounded-lg" style={{ backgroundColor: formData.cor_fundo }}>
              <div className="text-center space-y-4">
                {logoPreview && (
                  <img
                    src={logoPreview || "/placeholder.svg"}
                    alt="Logo preview"
                    className="w-16 h-16 object-contain mx-auto"
                  />
                )}
                <h3 className="text-xl font-bold" style={{ color: formData.cor_texto }}>
                  {formData.titulo || formData.nome}
                </h3>
                {formData.subtitulo && (
                  <p className="text-sm" style={{ color: formData.cor_texto }}>
                    {formData.subtitulo}
                  </p>
                )}
                <div className="space-y-2">
                  <p className="text-2xl font-bold" style={{ color: formData.cor_texto }}>
                    R$ {formData.preco || "0,00"}
                  </p>
                  <Button type="button" style={{ backgroundColor: formData.cor_botao }} className="text-white">
                    Comprar Agora
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>ID:</strong> {product.id}
              </div>
              <div>
                <strong>URL do Checkout:</strong>
                <Link href={product.url_checkout} target="_blank" className="text-blue-600 hover:underline ml-1">
                  {product.url_checkout}
                </Link>
              </div>
              <div>
                <strong>Criado em:</strong> {new Date(product.created_at).toLocaleString("pt-BR")}
              </div>
              <div>
                <strong>Atualizado em:</strong> {new Date(product.updated_at).toLocaleString("pt-BR")}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4">
          <Link href="/dashboard/produtos">
            <Button variant="outline" disabled={loading}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
