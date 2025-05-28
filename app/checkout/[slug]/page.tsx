"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Clock, CheckCircle, CreditCard, QrCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<any>(null)
  const [checkout, setCheckout] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadProductAndCheckout()
  }, [params.slug])

  const loadProductAndCheckout = async () => {
    try {
      console.log("🔍 Carregando produto e checkout para:", params.slug)

      // Carregar produto
      const productResponse = await fetch(`/api/products/by-slug/${params.slug}`)
      if (!productResponse.ok) {
        throw new Error("Produto não encontrado")
      }

      const productData = await productResponse.json()
      console.log("✅ Produto carregado:", productData.product.name)
      setProduct(productData.product)

      // Carregar configurações do checkout
      const checkoutResponse = await fetch(`/api/products/${productData.product.id}/checkout`)
      if (checkoutResponse.ok) {
        const checkoutData = await checkoutResponse.json()
        console.log("✅ Checkout carregado:", checkoutData.checkout)
        setCheckout(checkoutData.checkout)
      } else {
        console.log("⚠️ Checkout não configurado, usando padrão")
        setCheckout({
          elements: [],
          settings: {},
          paymentMethods: ["pix", "credit_card"],
        })
      }
    } catch (error) {
      console.error("❌ Erro ao carregar:", error)
      toast({
        title: "Erro",
        description: "Produto não encontrado ou não disponível",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setFormData((prev) => ({
      ...prev,
      cpf: formatted,
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      })
      return false
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast({
        title: "Erro",
        description: "Email válido é obrigatório",
        variant: "destructive",
      })
      return false
    }

    if (!formData.cpf.trim() || formData.cpf.replace(/\D/g, "").length !== 11) {
      toast({
        title: "Erro",
        description: "CPF válido é obrigatório",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handlePixPayment = async () => {
    if (!validateForm()) return

    setProcessing(true)

    try {
      console.log("🔄 Processando pagamento PIX...")

      // Simular processamento de pagamento
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "PIX gerado!",
        description: "QR Code criado com sucesso. Efetue o pagamento para confirmar sua compra.",
      })

      // Aqui você integraria com a API de pagamento real
    } catch (error) {
      console.error("Erro no pagamento:", error)
      toast({
        title: "Erro",
        description: "Erro ao processar pagamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const formatPrice = (price: any) => {
    const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando checkout...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <p className="text-gray-600">O produto que você está procurando não existe ou não está disponível.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-600">InfoPlatform</div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Checkout Seguro</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Checkout */}
          <div className="space-y-6">
            {/* Informações do Produto */}
            <Card>
              <CardHeader>
                <CardTitle>Você está comprando</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  {product.image ? (
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <QrCode className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-gray-600 text-sm">{product.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary">{product.category}</Badge>
                      <Badge className="bg-green-100 text-green-800">R$ {formatPrice(product.price)}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dados do Comprador */}
            <Card>
              <CardHeader>
                <CardTitle>Seus Dados</CardTitle>
                <CardDescription>Preencha suas informações para finalizar a compra</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      type="text"
                      value={formData.cpf}
                      onChange={handleCPFChange}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone (opcional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="text"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métodos de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Método de Pagamento</CardTitle>
                <CardDescription>Escolha como deseja pagar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handlePixPayment}
                  disabled={processing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {processing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Gerando PIX...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <QrCode className="h-5 w-5 mr-2" />
                      Pagar com PIX - R$ {formatPrice(product.price)}
                    </div>
                  )}
                </Button>

                <Button disabled variant="outline" className="w-full" size="lg">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Cartão de Crédito (Em breve)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Resumo e Garantias */}
          <div className="space-y-6">
            {/* Resumo do Pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {formatPrice(product.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Desconto:</span>
                  <span className="text-green-600">R$ 0,00</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>R$ {formatPrice(product.price)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Garantias */}
            <Card>
              <CardHeader>
                <CardTitle>Suas Garantias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <p className="font-medium">Garantia de 7 dias</p>
                    <p className="text-sm text-gray-600">100% do seu dinheiro de volta</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <p className="font-medium">Acesso imediato</p>
                    <p className="text-sm text-gray-600">Receba o produto após o pagamento</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-purple-500 mr-3" />
                  <div>
                    <p className="font-medium">Suporte incluso</p>
                    <p className="text-sm text-gray-600">Tire suas dúvidas conosco</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Depoimentos */}
            <Card>
              <CardHeader>
                <CardTitle>⭐ O que nossos clientes dizem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="italic mb-2">"Produto incrível! Superou minhas expectativas."</p>
                  <p className="font-semibold text-sm">- Maria Silva</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="italic mb-2">"Recomendo para todos. Muito bom!"</p>
                  <p className="font-semibold text-sm">- João Santos</p>
                </div>
              </CardContent>
            </Card>
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
