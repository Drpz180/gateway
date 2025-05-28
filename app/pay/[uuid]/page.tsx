"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, CreditCard, Star, Apple, QrCode, Smartphone, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Componente PIX
const PixPayment: React.FC<{
  qrCode: string
  copyPasteCode: string
  amount: number
  expiresAt: string
  onCopy: () => void
}> = ({ qrCode, copyPasteCode, amount, expiresAt, onCopy }) => {
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const expiry = new Date(expiresAt).getTime()
      const difference = expiry - now

      if (difference > 0) {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`)
      } else {
        setTimeLeft("Expirado")
      }
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyPasteCode)
      setCopied(true)
      onCopy()
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <QrCode className="h-6 w-6 text-blue-600" />
          <span>Pagamento PIX</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Escaneie o QR Code ou copie o código PIX</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg border">
            <img
              src={qrCode || "/placeholder.svg"}
              alt="QR Code PIX"
              className="w-48 h-48 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=192&width=192"
              }}
            />
          </div>
        </div>

        {/* Informações */}
        <div className="text-center space-y-2">
          <p className="text-2xl font-bold text-green-600">R$ {Number(amount).toFixed(2).replace(".", ",")}</p>
          <p className="text-sm text-gray-600">
            Expira em: <span className="font-semibold text-red-600">{timeLeft}</span>
          </p>
        </div>

        {/* Código PIX */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Código PIX (Copia e Cola)</Label>
          <div className="flex space-x-2">
            <Input value={copyPasteCode} readOnly className="font-mono text-xs" />
            <Button onClick={handleCopy} variant="outline" size="sm" className="flex-shrink-0">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-2">Como pagar:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Abra o app do seu banco</li>
            <li>Escolha a opção PIX</li>
            <li>Escaneie o QR Code ou cole o código</li>
            <li>Confirme o pagamento</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente de Cronômetro
const CountdownTimer: React.FC<{
  content: any
  isEditing?: boolean
}> = ({ content, isEditing = false }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: content.days || 0,
    hours: content.hours || 23,
    minutes: content.minutes || 59,
    seconds: content.seconds || 59,
  })

  useEffect(() => {
    if (!isEditing) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 }
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
          } else if (prev.hours > 0) {
            return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
          } else if (prev.days > 0) {
            return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
          }
          return prev
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isEditing])

  return (
    <div
      className="p-6 rounded-lg text-center"
      style={{
        backgroundColor: content.bgColor || "#fef2f2",
        borderColor: content.borderColor || "#fecaca",
        border: `2px solid ${content.borderColor || "#fecaca"}`,
      }}
    >
      <h3 className="font-bold text-xl mb-4" style={{ color: content.textColor || "#dc2626" }}>
        {content.title || "⏰ Oferta por tempo limitado!"}
      </h3>
      <div className="flex justify-center space-x-3 text-2xl font-mono mb-2">
        <div className="flex flex-col items-center">
          <div className="bg-black text-white px-4 py-3 rounded-lg min-w-[60px] text-3xl font-bold">
            {String(timeLeft.days).padStart(2, "0")}
          </div>
          <span className="text-xs mt-2 font-semibold" style={{ color: content.textColor || "#dc2626" }}>
            DIAS
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-black text-white px-4 py-3 rounded-lg min-w-[60px] text-3xl font-bold">
            {String(timeLeft.hours).padStart(2, "0")}
          </div>
          <span className="text-xs mt-2 font-semibold" style={{ color: content.textColor || "#dc2626" }}>
            HORAS
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-black text-white px-4 py-3 rounded-lg min-w-[60px] text-3xl font-bold">
            {String(timeLeft.minutes).padStart(2, "0")}
          </div>
          <span className="text-xs mt-2 font-semibold" style={{ color: content.textColor || "#dc2626" }}>
            MIN
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-black text-white px-4 py-3 rounded-lg min-w-[60px] text-3xl font-bold">
            {String(timeLeft.seconds).padStart(2, "0")}
          </div>
          <span className="text-xs mt-2 font-semibold" style={{ color: content.textColor || "#dc2626" }}>
            SEG
          </span>
        </div>
      </div>
      <p className="text-sm mt-4" style={{ color: content.textColor || "#dc2626" }}>
        {content.subtitle || "Não perca esta oportunidade única!"}
      </p>
    </div>
  )
}

export default function PaymentPage({ params }: { params: { uuid: string } }) {
  const [product, setProduct] = useState<any>(null)
  const [checkout, setCheckout] = useState<any>(null)
  const [productSettings, setProductSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [pixData, setPixData] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    // Detectar se é mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    loadProductAndCheckout()
  }, [params.uuid])

  const loadProductAndCheckout = async () => {
    try {
      console.log("🔍 Carregando produto e checkout para UUID:", params.uuid)

      const response = await fetch(`/api/pay/${params.uuid}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
        throw new Error(errorData.error || "Produto não encontrado")
      }

      const data = await response.json()
      console.log("✅ Dados carregados:", data)

      if (!data.success) {
        throw new Error(data.error || "Erro ao carregar produto")
      }

      setProduct(data.product)
      setCheckout(data.checkout)
      setProductSettings(data.productSettings)

      // Definir método de pagamento padrão (primeiro habilitado)
      const enabledMethods = data.productSettings?.paymentMethods?.filter((method: any) => method.enabled) || []
      if (enabledMethods.length > 0) {
        setSelectedPaymentMethod(enabledMethods[0].id)
      }

      // Registrar clique
      fetch(`/api/pay/${params.uuid}/track`, { method: "POST" }).catch((err) =>
        console.warn("Erro ao registrar clique:", err),
      )
    } catch (error) {
      console.error("❌ Erro ao carregar:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Produto não encontrado ou não disponível",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderElement = (element: any) => {
    const { type, content } = element
    const settings = checkout?.settings || {}

    switch (type) {
      case "text":
        return (
          <div
            key={element.id}
            style={{
              fontSize: content.fontSize,
              color: content.color,
              textAlign: content.align,
              fontFamily: settings.fontFamily || "Inter",
            }}
            className="p-4 min-h-[40px]"
          >
            {content.text}
          </div>
        )

      case "image":
        return (
          <div key={element.id} className="p-4 flex justify-center">
            <img
              src={content.src || "/placeholder.svg"}
              alt={content.alt}
              className="object-cover rounded"
              style={{
                width: content.width,
                height: content.height,
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=200&width=300"
              }}
            />
          </div>
        )

      case "benefits":
        return (
          <div key={element.id} className="p-6 bg-green-50 rounded-lg">
            <h3
              className="font-bold text-xl mb-4"
              style={{ fontFamily: settings.fontFamily || "Inter", color: content.titleColor || "#1f2937" }}
            >
              {content.title}
            </h3>
            <ul className="space-y-3">
              {content.items.map((item: string, index: number) => (
                <li key={index} className="flex items-center space-x-3">
                  <span
                    className="text-lg font-semibold"
                    style={{ color: content.color, fontFamily: settings.fontFamily || "Inter" }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )

      case "timer":
        return (
          <div key={element.id}>
            <CountdownTimer content={content} />
          </div>
        )

      case "testimonial":
        return (
          <div key={element.id} className="p-6 rounded-lg" style={{ backgroundColor: content.bgColor }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={content.avatar || "/placeholder.svg"}
                  alt={content.name}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=60&width=60"
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < content.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <p
                  className="italic mb-3 text-lg leading-relaxed"
                  style={{ fontFamily: settings.fontFamily || "Inter", color: content.textColor }}
                >
                  "{content.text}"
                </p>
                <p
                  className="font-semibold text-lg"
                  style={{ fontFamily: settings.fontFamily || "Inter", color: content.nameColor }}
                >
                  {content.name}
                </p>
                {content.region && (
                  <p
                    className="text-sm"
                    style={{ fontFamily: settings.fontFamily || "Inter", color: content.regionColor }}
                  >
                    {content.region}
                  </p>
                )}
              </div>
            </div>
          </div>
        )

      case "header":
        return (
          <div key={element.id} className="p-6 text-center">
            <h1
              className="text-4xl font-bold mb-3"
              style={{ color: content.titleColor, fontFamily: settings.fontFamily || "Inter" }}
            >
              {content.title}
            </h1>
            {content.subtitle && (
              <p
                className="text-xl"
                style={{ color: content.subtitleColor, fontFamily: settings.fontFamily || "Inter" }}
              >
                {content.subtitle}
              </p>
            )}
          </div>
        )

      default:
        return (
          <div key={element.id} className="p-4 border border-dashed border-gray-300 bg-gray-50 rounded">
            <p className="text-gray-600" style={{ fontFamily: settings.fontFamily || "Inter" }}>
              Elemento: {type}
            </p>
          </div>
        )
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

    if (!selectedPaymentMethod) {
      toast({
        title: "Erro",
        description: "Selecione um método de pagamento",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handlePayment = async () => {
    if (!validateForm()) return

    setProcessing(true)

    try {
      console.log("🔄 Processando pagamento:", selectedPaymentMethod)

      if (selectedPaymentMethod === "pix") {
        // Criar PIX real via EfiBank
        const response = await fetch("/api/payments/pix/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
            offerId: "1",
            amount: Number(product.preco),
            buyerName: formData.name,
            buyerEmail: formData.email,
            buyerCpf: formData.cpf,
            description: `${product.nome} - Pagamento via PIX`,
          }),
        })

        if (!response.ok) {
          throw new Error("Erro ao criar PIX")
        }

        const pixResult = await response.json()

        if (pixResult.success) {
          setPixData(pixResult)
          toast({
            title: "PIX gerado!",
            description: "Escaneie o QR Code ou copie o código PIX para pagar",
          })
        } else {
          throw new Error(pixResult.message || "Erro ao gerar PIX")
        }
      } else {
        // Outros métodos de pagamento
        await new Promise((resolve) => setTimeout(resolve, 2000))

        toast({
          title: "Pagamento processado!",
          description: `Pagamento via ${getPaymentMethodName(selectedPaymentMethod)} processado com sucesso.`,
        })
      }

      // Registrar conversão
      fetch(`/api/pay/${params.uuid}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "conversion", paymentMethod: selectedPaymentMethod }),
      }).catch((err) => console.warn("Erro ao registrar conversão:", err))
    } catch (error) {
      console.error("Erro no pagamento:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar pagamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const getPaymentMethodName = (id: string) => {
    const method = enabledPaymentMethods.find((m: any) => m.id === id)
    return method?.name || id
  }

  const getPaymentMethodIcon = (id: string) => {
    switch (id) {
      case "pix":
        return <QrCode className="h-6 w-6" />
      case "credit_card":
        return <CreditCard className="h-6 w-6" />
      case "apple_pay":
        return <Apple className="h-6 w-6" />
      case "google_pay":
        return <Smartphone className="h-6 w-6" />
      default:
        return <CreditCard className="h-6 w-6" />
    }
  }

  const formatPrice = (price: any) => {
    if (price === null || price === undefined) return "0,00"
    const numPrice = typeof price === "string" ? Number.parseFloat(price.replace(",", ".")) : price
    return isNaN(numPrice) ? "0,00" : numPrice.toFixed(2).replace(".", ",")
  }

  // Filtrar apenas métodos de pagamento habilitados das configurações do produto
  const enabledPaymentMethods = productSettings?.paymentMethods?.filter((method: any) => method.enabled) || []

  console.log("🔧 Métodos de pagamento habilitados:", enabledPaymentMethods)

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
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Produto não encontrado</h1>
          <p className="text-gray-600 mb-6">Este produto foi removido da nossa base de dados.</p>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Se você acredita que isso é um erro, entre em contato conosco.</p>
          </div>
        </div>
      </div>
    )
  }

  const settings = checkout?.settings || {}

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: settings.fontFamily || "Inter" }}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl fontt-bold text-blue-600">InfoPlatform</div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Checkout Seguro</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`${isMobile ? "block" : "grid grid-cols-3 gap-8"}`}>
          {/* Coluna Principal - Elementos Personalizáveis */}
          <div className={`${isMobile ? "order-1" : "col-span-2"} space-y-6`}>
            {/* Elementos Dinâmicos do Checkout Builder */}
            {checkout?.elements && checkout.elements.length > 0 ? (
              checkout.elements.map((element: any) => renderElement(element))
            ) : (
              // Elementos padrão se não houver checkout personalizado
              <>
                <div className="p-6 text-center">
                  <h1 className="text-4xl font-bold mb-3 text-gray-900">{product.nome}</h1>
                  <p className="text-xl text-gray-600">Transforme sua vida hoje mesmo!</p>
                </div>
              </>
            )}

            {/* Se PIX foi gerado, mostrar */}
            {pixData && (
              <PixPayment
                qrCode={pixData.qrCode}
                copyPasteCode={pixData.copyPasteCode}
                amount={pixData.amount}
                expiresAt={pixData.expiresAt}
                onCopy={() => {
                  toast({
                    title: "Código copiado!",
                    description: "Cole no seu app do banco para pagar",
                  })
                }}
              />
            )}

            {/* Formulário de Dados - Só mostra se não tiver PIX gerado */}
            {!pixData && (
              <>
                <Card className="border-2 border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2">
                      <span>👤</span>
                      <span>Seus dados</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Nome completo</Label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Nome do comprador"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="email@email.com"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">CPF</Label>
                        <Input
                          name="cpf"
                          value={formData.cpf}
                          onChange={handleCPFChange}
                          placeholder="304.761.060-23"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Celular</Label>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+55 (99) 99999-9999"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Métodos de Pagamento - Apenas os habilitados */}
                {enabledPaymentMethods.length > 0 && (
                  <Card className="border-2 border-gray-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-2">
                        <span>💳</span>
                        <span>Método de Pagamento</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {enabledPaymentMethods.map((method: any) => (
                          <Button
                            key={method.id}
                            variant={selectedPaymentMethod === method.id ? "default" : "outline"}
                            className={`h-16 flex flex-col items-center justify-center space-y-1 border-2 ${
                              selectedPaymentMethod === method.id
                                ? "border-blue-500 bg-blue-50"
                                : "hover:border-blue-300"
                            }`}
                            onClick={() => setSelectedPaymentMethod(method.id)}
                          >
                            {getPaymentMethodIcon(method.id)}
                            <span className="text-xs font-medium">{method.name}</span>
                          </Button>
                        ))}
                      </div>

                      {/* Formulário específico do método selecionado */}
                      {selectedPaymentMethod === "credit_card" && (
                        <div className="space-y-4 pt-4 border-t">
                          <div>
                            <Label className="text-sm font-medium">Número do cartão</Label>
                            <Input placeholder="9105 1456 9541 4010" className="mt-1" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Validade</Label>
                              <Input placeholder="10/25" className="mt-1" />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">CVV</Label>
                              <Input placeholder="123" className="mt-1" />
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Parcelas</Label>
                            <Select>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder={`1 x de R$ ${formatPrice(product.preco)}`} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1x de R$ {formatPrice(product.preco)} à vista</SelectItem>
                                <SelectItem value="2">2x de R$ {formatPrice(product.preco / 2)}</SelectItem>
                                <SelectItem value="3">3x de R$ {formatPrice(product.preco / 3)}</SelectItem>
                                <SelectItem value="6">6x de R$ {formatPrice(product.preco / 6)}</SelectItem>
                                <SelectItem value="12">12x de R$ {formatPrice(product.preco / 12)}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Botão de Compra */}
                <Button
                  onClick={handlePayment}
                  disabled={processing || enabledPaymentMethods.length === 0}
                  className="w-full h-14 text-lg font-bold"
                  style={{
                    backgroundColor: settings.buttonBgColor || "#059669",
                    color: settings.buttonTextColor || "#ffffff",
                  }}
                >
                  {processing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando...
                    </div>
                  ) : enabledPaymentMethods.length === 0 ? (
                    "Nenhum método de pagamento disponível"
                  ) : selectedPaymentMethod === "pix" ? (
                    `Gerar PIX - R$ ${formatPrice(product.preco)}`
                  ) : (
                    `Finalizar Compra - R$ ${formatPrice(product.preco)}`
                  )}
                </Button>
              </>
            )}

            {/* Segurança */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Os seus dados de pagamento são criptografados e processados de forma segura.</span>
              </div>
              <div className="text-xs text-gray-500">
                <p>Este site é processado pela InfoPlatform</p>
                <p>
                  Ao completar você concorda com os{" "}
                  <a href="#" className="text-blue-600 underline">
                    Termos de serviço
                  </a>{" "}
                  e{" "}
                  <a href="#" className="text-blue-600 underline">
                    Política de privacidade
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - Resumo do Pedido (Desktop) */}
          {!isMobile && (
            <div className="bg-gray-50 p-6 border-l">
              <div className="sticky top-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Compra segura</h3>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600 ml-1">SSL</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-6">
                    <img
                      src={product.logo_url || "/placeholder.svg?height=80&width=80"}
                      alt={product.nome}
                      className="w-20 h-20 rounded object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=80&width=80"
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.nome}</h3>
                      <p className="text-sm text-gray-600">1 x de R$ {formatPrice(product.preco)}</p>
                      <p className="text-xs text-blue-600 underline cursor-pointer">Veja o resumo do conteúdo</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="text-xl font-bold">R$ {formatPrice(product.preco)}</span>
                    </div>
                    <p className="text-sm text-gray-600">ou R$ {formatPrice(product.preco)} à vista</p>
                    {enabledPaymentMethods.some((m: any) => m.id === "credit_card") && (
                      <p className="text-xs text-gray-500">Parcelamento disponível</p>
                    )}
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">InfoPlatform</span>
                    </div>
                    <p className="text-xs text-green-700">
                      InfoPlatform está processando este pagamento para o vendedor {product.creator}
                    </p>
                  </div>

                  {/* Métodos de pagamento disponíveis */}
                  {enabledPaymentMethods.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs text-gray-600 mb-2">Métodos de pagamento disponíveis:</p>
                      <div className="flex flex-wrap gap-2">
                        {enabledPaymentMethods.map((method: any) => (
                          <div
                            key={method.id}
                            className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs"
                          >
                            {getPaymentMethodIcon(method.id)}
                            <span>{method.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Este site é protegido pelo reCAPTCHA do Google.</p>
                    <p>
                      <a href="#" className="text-blue-600 underline">
                        Política de privacidade
                      </a>{" "}
                      e{" "}
                      <a href="#" className="text-blue-600 underline">
                        Termos de serviço
                      </a>
                    </p>
                    {enabledPaymentMethods.some((m: any) => m.id === "credit_card") && (
                      <p>* Parcelamento sem acréscimo</p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t text-center">
                    <p className="text-xs text-gray-500">
                      Ao completar, você concorda com os{" "}
                      <a href="#" className="text-blue-600 underline">
                        Termos de Compra
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
