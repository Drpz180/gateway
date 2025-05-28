"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Palette, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function NovoProdutoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "digital",
    price: "",
    cor_fundo: "#ffffff",
    cor_botao: "#00b894",
    cor_texto: "#000000",
    titulo: "",
    subtitulo: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "name" && !formData.titulo) {
      setFormData((prev) => ({
        ...prev,
        titulo: value,
      }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Erro",
          description: "Selecione uma imagem válida",
          variant: "destructive",
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "Imagem deve ter no máximo 5MB",
          variant: "destructive",
        })
        return
      }

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
      console.log("=== INICIANDO ENVIO ===")
      console.log("📋 Form Data:", formData)

      // VALIDAÇÕES FRONTEND
      if (!formData.name || !formData.name.trim()) {
        toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" })
        setLoading(false)
        return
      }

      if (!formData.description || !formData.description.trim()) {
        toast({ title: "Erro", description: "Descrição é obrigatória", variant: "destructive" })
        setLoading(false)
        return
      }

      if (!formData.price || !formData.price.trim()) {
        toast({ title: "Erro", description: "Preço é obrigatório", variant: "destructive" })
        setLoading(false)
        return
      }

      // CONVERTER PREÇO
      let priceNumber: number
      try {
        const cleanPrice = formData.price.replace(/[^\d.,]/g, "")

        if (cleanPrice.includes(",")) {
          if (cleanPrice.includes(".") && cleanPrice.includes(",")) {
            const parts = cleanPrice.split(",")
            const integerPart = parts[0].replace(/\./g, "")
            const decimalPart = parts[1] || "00"
            priceNumber = Number.parseFloat(`${integerPart}.${decimalPart}`)
          } else {
            priceNumber = Number.parseFloat(cleanPrice.replace(",", "."))
          }
        } else {
          priceNumber = Number.parseFloat(cleanPrice)
        }

        if (isNaN(priceNumber) || priceNumber <= 0) {
          throw new Error("Preço inválido")
        }
      } catch (error) {
        toast({ title: "Erro", description: "Preço inválido. Use formato: 67.90 ou 67,90", variant: "destructive" })
        setLoading(false)
        return
      }

      // CRIAR PAYLOAD
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: priceNumber,
        cor_fundo: formData.cor_fundo,
        cor_botao: formData.cor_botao,
        cor_texto: formData.cor_texto,
        titulo: formData.titulo.trim() || formData.name.trim(),
        subtitulo: formData.subtitulo.trim(),
      }

      console.log("📤 Payload final:", payload)
      console.log("Enviando requisição...")

      // Criar headers explicitamente
      const headers = new Headers()
      headers.set("Content-Type", "application/json")
      headers.set("Accept", "application/json")

      console.log("📡 Headers sendo enviados:", Object.fromEntries(headers.entries()))

      const response = await fetch("/api/products", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log("📡 Response text:", responseText.substring(0, 200))

      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ Erro ao fazer parse da resposta:", parseError)
        throw new Error("Resposta inválida do servidor")
      }

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message || "Produto criado com sucesso!",
        })
        router.push("/dashboard/produtos")
      } else {
        console.error("❌ Erro da API:", result)
        toast({
          title: "Erro",
          description: result.message || result.error || "Erro ao criar produto",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Erro na requisição:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro de conexão",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/produtos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Novo Produto</h1>
          <p className="text-gray-600">Crie um novo infoproduto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Dados principais do produto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
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
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                name="price"
                placeholder="67.90"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-gray-500">
                Digite o preço (ex: 67.90 ou 67,90). Valor atual: "{formData.price}"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">Produto Digital</SelectItem>
                  <SelectItem value="course">Curso Online</SelectItem>
                  <SelectItem value="ebook">E-book</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Logo do Produto</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input id="productImage" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              <label
                htmlFor="productImage"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                {logoPreview ? (
                  <div className="space-y-2">
                    <img
                      src={logoPreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-32 h-32 object-contain rounded-lg border"
                    />
                    <p className="text-sm text-gray-600">Clique para alterar</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Clique para selecionar logo</span>
                  </>
                )}
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Personalização</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  placeholder="Preenchido automaticamente"
                  value={formData.titulo}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitulo">Subtítulo</Label>
                <Input
                  id="subtitulo"
                  name="subtitulo"
                  placeholder="Ex: Transforme sua vida!"
                  value={formData.subtitulo}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cor de Fundo</Label>
                <Input type="color" name="cor_fundo" value={formData.cor_fundo} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label>Cor do Botão</Label>
                <Input type="color" name="cor_botao" value={formData.cor_botao} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label>Cor do Texto</Label>
                <Input type="color" name="cor_texto" value={formData.cor_texto} onChange={handleInputChange} />
              </div>
            </div>

            <div className="mt-6 p-4 border rounded-lg" style={{ backgroundColor: formData.cor_fundo }}>
              <div className="text-center space-y-4">
                {logoPreview && (
                  <img
                    src={logoPreview || "/placeholder.svg"}
                    alt="Logo"
                    className="w-16 h-16 object-contain mx-auto"
                  />
                )}
                <h3 className="text-xl font-bold" style={{ color: formData.cor_texto }}>
                  {formData.titulo || formData.name || "Título do Produto"}
                </h3>
                {formData.subtitulo && (
                  <p className="text-sm" style={{ color: formData.cor_texto }}>
                    {formData.subtitulo}
                  </p>
                )}
                <div className="space-y-2">
                  <p className="text-2xl font-bold" style={{ color: formData.cor_texto }}>
                    R$ {formData.price || "0,00"}
                  </p>
                  <Button type="button" style={{ backgroundColor: formData.cor_botao }} className="text-white">
                    Comprar Agora
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Link href="/dashboard/produtos">
            <Button variant="outline" disabled={loading}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Criando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Criar Produto
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
