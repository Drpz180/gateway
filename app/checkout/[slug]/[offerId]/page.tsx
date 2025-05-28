"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { ProductDB } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Shield, Clock, Copy, QrCode, CreditCard } from "lucide-react"
import Link from "next/link"

interface CheckoutPageProps {
  params: {
    slug: string
    offerId: string
  }
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const [product, setProduct] = useState<any>(null)
  const [offer, setOffer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [pixData, setPixData] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
  })

  const { toast } = useToast()

  useEffect(() => {
    loadProductData()
  }, [params.slug, params.offerId])

  const loadProductData = async () => {
    try {
      // Simular carregamento do produto
      const productData = ProductDB.findBySlug(params.slug)

      if (!productData || productData.status !== "approved") {
        notFound()
        return
      }

      const offerData = productData.offers.find((o: any) => o.id === params.offerId)

      if (!offerData) {
        notFound()
        return
      }

      setProduct(productData)
      setOffer(offerData)
    } catch (error) {
      console.error("Erro ao carregar produto:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do produto",
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

    setProcessingPayment(true)

    try {
      console.log("🔄 Processando pagamento PIX...")

      const response = await fetch("/api/payments/pix/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          offerId: offer.id,
          amount: offer.price,
          buyerName: formData.name,
          buyerEmail: formData.email,
          buyerCpf: formData.cpf.replace(/\D/g, ""),
          description: `${product.name} - ${offer.name}`,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao processar pagamento")
      }

      const result = await response.json()

      setPixData(result)

      toast({
        title: "PIX gerado!",
        description: "QR Code criado com sucesso. Efetue o pagamento para confirmar sua compra.",
      })
    } catch (error) {
      console.error("Erro no pagamento:", error)
      toast({
        title: "Erro",
        description: "Erro ao processar pagamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setProcessingPayment(false)
    }
  }

  const copyPixCode = () => {
    if (pixData?.copyPasteCode) {
      navigator.clipboard.writeText(pixData.copyPasteCode)
      toast({
        title: "Copiado!",
        description: "Código PIX copiado para a área de transferência",
      })
    }
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

  if (!product || !offer) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              InfoPlatform
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Checkout Seguro</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Pagamento */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Comprador</CardTitle>
                <CardDescription>Preencha seus dados para finalizar a compra</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            {/* Métodos de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Método de Pagamento</CardTitle>
                <CardDescription>Escolha como deseja pagar</CardDescription>
              </CardHeader>
              <CardContent>
                {!pixData ? (
                  <div className="space-y-4">
                    <Button
                      onClick={handlePixPayment}
                      disabled={processingPayment}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      {processingPayment ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Gerando PIX...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <QrCode className="h-5 w-5 mr-2" />
                          Pagar com PIX
                        </div>
                      )}
                    </Button>

                    <Button disabled variant="outline" className="w-full" size="lg">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Cartão de Crédito (Em breve)
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="bg-green-100 p-4 rounded-lg mb-4">
                        <QrCode className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-green-800">PIX gerado com sucesso!</h3>
                        <p className="text-sm text-green-600">Escaneie o QR Code ou copie o código</p>
                      </div>

                      {/* QR Code */}
                      <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                        <img
                          src={`data:image/png;base64,${pixData.qrCode}`}
                          alt="QR Code PIX"
                          className="mx-auto max-w-64"
                        />
                      </div>

                      {/* Código PIX */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <Label className="text-sm font-medium text-gray-700">Código PIX (Copia e Cola)</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Input value={pixData.copyPasteCode} readOnly className="text-xs" />
                          <Button onClick={copyPixCode} size="sm" variant="outline">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Instruções */}
                      <div className="text-left mt-6 space-y-2 text-sm text-gray-600">
                        <p className="font-medium">Como pagar:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Abra o app do seu banco</li>
                          <li>Escolha a opção PIX</li>
                          <li>Escaneie o QR Code ou cole o código</li>
                          <li>Confirme o pagamento</li>
                        </ol>
                      </div>

                      {/* Timer */}
                      <div className="bg-yellow-50 p-3 rounded-lg mt-4">
                        <div className="flex items-center justify-center">
                          <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                          <span className="text-sm text-yellow-800">
                            PIX expira em: <strong>1 hora</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resumo do Pedido */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4 mb-6">
                  <img
                    src={product.image || "/placeholder.svg?height=80&width=80"}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-gray-600">{offer.name}</p>
                    <Badge variant="secondary" className="mt-1">
                      {product.category}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {offer.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Desconto:</span>
                    <span className="text-green-600">-R$ {(offer.originalPrice - offer.price).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>R$ {offer.price.toFixed(2)}</span>
                  </div>
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
                    <p className="font-medium">Acesso vitalício</p>
                    <p className="text-sm text-gray-600">Sem mensalidades</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <QrCode className="h-5 w-5 text-purple-500 mr-3" />
                  <div>
                    <p className="font-medium">Certificado incluso</p>
                    <p className="text-sm text-gray-600">Reconhecido no mercado</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suporte */}
            <Card>
              <CardHeader>
                <CardTitle>Precisa de Ajuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Nossa equipe está pronta para ajudar você com qualquer dúvida sobre o pagamento ou produto.
                </p>
                <Button variant="outline" className="w-full">
                  Falar com Suporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
