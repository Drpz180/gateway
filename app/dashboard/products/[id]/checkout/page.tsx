"use client"

import type React from "react"
import type { FunctionComponent } from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Type,
  ImageIcon,
  CheckCircle,
  Award,
  HeadingIcon as Header,
  List,
  Clock,
  MessageSquare,
  Video,
  Save,
  Eye,
  Smartphone,
  Monitor,
  Upload,
  Trash2,
  CreditCard,
  Shield,
  ArrowLeft,
  Star,
  Apple,
  Phone,
  Edit3,
  Move,
} from "lucide-react"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface CheckoutElement {
  id: string
  type: string
  content: any
  position: { x: number; y: number }
  order: number
}

interface CheckoutSettings {
  fontFamily: string
  primaryColor: string
  secondaryColor: string
  activeColor: string
  iconColor: string
  formBgColor: string
  buttonTextColor: string
  buttonBgColor: string
  buttonIconColor: string
  selectedButtonBg: string
  unselectedButtonBg: string
}

interface PaymentMethod {
  id: string
  name: string
  enabled: boolean
}

const ELEMENT_TYPES = [
  { type: "text", icon: Type, label: "Texto", category: "content" },
  { type: "image", icon: ImageIcon, label: "Imagem", category: "content" },
  { type: "benefits", icon: CheckCircle, label: "Vantagens", category: "content" },
  { type: "badge", icon: Award, label: "Selo", category: "content" },
  { type: "header", icon: Header, label: "Header", category: "content" },
  { type: "list", icon: List, label: "Lista", category: "content" },
  { type: "timer", icon: Clock, label: "Cronômetro", category: "content" },
  { type: "testimonial", icon: MessageSquare, label: "Depoimento", category: "content" },
  { type: "video", icon: Video, label: "Vídeo", category: "content" },
]

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Poppins", label: "Poppins" },
]

// Componente para upload de imagem
const ImageUploader: FunctionComponent<{
  onImageUpload: (src: string) => void
  currentImage?: string | null
  className?: string
  small?: boolean
}> = ({ onImageUpload, currentImage, className = "", small = false }) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      const imageFile = files.find((file) => file.type.startsWith("image/"))

      if (imageFile) {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            onImageUpload(e.target.result as string)
          }
        }
        reader.readAsDataURL(imageFile)
      }
    },
    [onImageUpload],
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageUpload(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
      } ${small ? "p-2" : "p-4"} ${className}`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => fileInputRef.current?.click()}
    >
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

      {currentImage ? (
        <div className="relative">
          <img
            src={currentImage || "/placeholder.svg"}
            alt="Preview"
            className={`object-cover rounded mx-auto ${small ? "w-16 h-16" : "max-w-full h-32"}`}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=100&width=100"
            }}
          />
          <p className="text-xs text-gray-500 mt-1">Clique ou arraste para alterar</p>
        </div>
      ) : (
        <div>
          <Upload className={`text-gray-400 mx-auto mb-2 ${small ? "h-6 w-6" : "h-8 w-8"}`} />
          <p className={`text-gray-600 ${small ? "text-xs" : "text-sm"}`}>
            {small ? "Arraste ou clique" : "Arraste uma imagem ou clique para selecionar"}
          </p>
          {!small && <p className="text-xs text-gray-500">JPG, PNG até 10MB</p>}
        </div>
      )}
    </div>
  )
}

// Componente de Imagem Redimensionável
const ResizableImage: FunctionComponent<{
  content: any
  onUpdate?: (content: any) => void
  isSelected?: boolean
}> = ({ content, onUpdate, isSelected = false }) => {
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [startSize, setStartSize] = useState({ width: 0, height: 0 })
  const imageRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeHandle(handle)
    setStartPos({ x: e.clientX, y: e.clientY })
    setStartSize({ width: content.width, height: content.height })
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeHandle || !onUpdate) return

      const deltaX = e.clientX - startPos.x
      const deltaY = e.clientY - startPos.y

      let newWidth = startSize.width
      let newHeight = startSize.height

      // Limites mínimos e máximos
      const minWidth = 100
      const maxWidth = 800
      const minHeight = 100
      const maxHeight = 600

      switch (resizeHandle) {
        case "se": // Southeast (bottom-right)
          newWidth = Math.max(minWidth, Math.min(maxWidth, startSize.width + deltaX))
          newHeight = Math.max(minHeight, Math.min(maxHeight, startSize.height + deltaY))
          break
        case "sw": // Southwest (bottom-left)
          newWidth = Math.max(minWidth, Math.min(maxWidth, startSize.width - deltaX))
          newHeight = Math.max(minHeight, Math.min(maxHeight, startSize.height + deltaY))
          break
        case "ne": // Northeast (top-right)
          newWidth = Math.max(minWidth, Math.min(maxWidth, startSize.width + deltaX))
          newHeight = Math.max(minHeight, Math.min(maxHeight, startSize.height - deltaY))
          break
        case "nw": // Northwest (top-left)
          newWidth = Math.max(minWidth, Math.min(maxWidth, startSize.width - deltaX))
          newHeight = Math.max(minHeight, Math.min(maxHeight, startSize.height - deltaY))
          break
        case "e": // East (right)
          newWidth = Math.max(minWidth, Math.min(maxWidth, startSize.width + deltaX))
          break
        case "w": // West (left)
          newWidth = Math.max(minWidth, Math.min(maxWidth, startSize.width - deltaX))
          break
        case "n": // North (top)
          newHeight = Math.max(minHeight, Math.min(maxHeight, startSize.height - deltaY))
          break
        case "s": // South (bottom)
          newHeight = Math.max(minHeight, Math.min(maxHeight, startSize.height + deltaY))
          break
      }

      onUpdate({
        ...content,
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      })
    },
    [isResizing, resizeHandle, startPos, startSize, content, onUpdate],
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    setResizeHandle(null)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={imageRef}
      className="relative inline-block"
      style={{
        width: content.width,
        height: content.height,
      }}
    >
      <img
        src={content.src || "/placeholder.svg"}
        alt={content.alt}
        className="w-full h-full object-cover rounded"
        style={{
          width: content.width,
          height: content.height,
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = "/placeholder.svg?height=200&width=300"
        }}
      />

      {/* Resize Handles - só aparecem quando selecionado */}
      {isSelected && onUpdate && (
        <>
          {/* Corner handles */}
          <div
            className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize"
            onMouseDown={(e) => handleMouseDown(e, "nw")}
          />
          <div
            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize"
            onMouseDown={(e) => handleMouseDown(e, "ne")}
          />
          <div
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize"
            onMouseDown={(e) => handleMouseDown(e, "sw")}
          />
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize"
            onMouseDown={(e) => handleMouseDown(e, "se")}
          />

          {/* Edge handles */}
          <div
            className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-n-resize"
            onMouseDown={(e) => handleMouseDown(e, "n")}
          />
          <div
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-s-resize"
            onMouseDown={(e) => handleMouseDown(e, "s")}
          />
          <div
            className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-w-resize"
            onMouseDown={(e) => handleMouseDown(e, "w")}
          />
          <div
            className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-e-resize"
            onMouseDown={(e) => handleMouseDown(e, "e")}
          />
        </>
      )}
    </div>
  )
}

// Componente de Cronômetro
const CountdownTimer: FunctionComponent<{
  content: any
  onUpdate?: (content: any) => void
  isEditing?: boolean
}> = ({ content, onUpdate, isEditing = false }) => {
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
      <h3 className="font-bold text-xl mb-4" style={{ color: content.textColor || "#dc2626", fontFamily: "Inter" }}>
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

export default function ProductCheckoutBuilderPage({ params }: { params: { id: string } }) {
  const [elements, setElements] = useState<CheckoutElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [product, setProduct] = useState({
    id: params.id,
    name: "",
    price: 0,
    originalPrice: 0,
    image: null as string | null,
  })
  const [loading, setLoading] = useState(true)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: "pix", name: "PIX", enabled: true },
    { id: "credit_card", name: "Cartão de Crédito", enabled: true },
    { id: "apple_pay", name: "Apple Pay", enabled: true },
    { id: "google_pay", name: "Google Pay", enabled: true },
    { id: "boleto", name: "Boleto", enabled: true },
  ])
  const [checkoutSettings, setCheckoutSettings] = useState<CheckoutSettings>({
    fontFamily: "Inter",
    primaryColor: "#059669",
    secondaryColor: "#64748b",
    activeColor: "#047857",
    iconColor: "#6366f1",
    formBgColor: "#ffffff",
    buttonTextColor: "#ffffff",
    buttonBgColor: "#059669",
    buttonIconColor: "#ffffff",
    selectedButtonBg: "#059669",
    unselectedButtonBg: "#f1f5f9",
  })

  const { toast } = useToast()

  // Carregar dados do produto e configurações
  useEffect(() => {
    const loadProduct = async () => {
      try {
        console.log("Carregando produto para checkout:", params.id)
        const response = await fetch(`/api/products/${params.id}`)

        if (response.ok) {
          const data = await response.json()
          const productData = data.product

          setProduct({
            id: productData.id,
            name: productData.name || "",
            price: productData.price || 0,
            originalPrice: productData.originalPrice || 0,
            image: productData.image,
          })

          // Carregar checkout salvo
          await loadSavedCheckout()

          // Carregar configurações de pagamento
          await loadPaymentSettings()

          console.log("Produto carregado para checkout:", productData.name)
        } else {
          console.error("Erro ao carregar produto:", response.status)
          toast({
            title: "Erro",
            description: "Produto não encontrado",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Erro ao carregar produto:", error)
        toast({
          title: "Erro",
          description: "Erro ao carregar produto",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [params.id, toast])

  const loadSavedCheckout = async () => {
    try {
      console.log("📖 Carregando checkout salvo...")
      const response = await fetch(`/api/products/${params.id}/checkout`)
      if (response.ok) {
        const data = await response.json()
        if (data.checkout && data.checkout.elements && data.checkout.elements.length > 0) {
          console.log("✅ Checkout salvo encontrado:", data.checkout.elements.length, "elementos")
          setElements(data.checkout.elements)
          if (data.checkout.settings) {
            setCheckoutSettings(data.checkout.settings)
          }
          if (data.checkout.paymentMethods) {
            setPaymentMethods(data.checkout.paymentMethods)
          }
        } else {
          console.log("📝 Criando elementos padrão")
          // Só criar elementos padrão se não houver checkout salvo
          const productResponse = await fetch(`/api/products/${params.id}`)
          if (productResponse.ok) {
            const productData = await productResponse.json()
            createDefaultElements(productData.product)
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar checkout salvo:", error)
    }
  }

  const loadPaymentSettings = async () => {
    try {
      console.log("⚙️ Carregando configurações de pagamento...")
      const response = await fetch(`/api/products/${params.id}/settings`)
      if (response.ok) {
        const data = await response.json()
        if (data.settings?.paymentMethods) {
          console.log("✅ Métodos de pagamento carregados:", data.settings.paymentMethods.length)
          setPaymentMethods(data.settings.paymentMethods)
        }
      }
    } catch (error) {
      console.error("Erro ao carregar configurações de pagamento:", error)
    }
  }

  const createDefaultElements = (productData: any) => {
    const defaultElements: CheckoutElement[] = [
      {
        id: "header-1",
        type: "header",
        content: {
          title: productData.name || "Seu Produto Incrível",
          subtitle: "Transforme sua vida hoje mesmo!",
          titleColor: "#1f2937",
          subtitleColor: "#6b7280",
        },
        position: { x: 0, y: 0 },
        order: 0,
      },
      {
        id: "timer-1",
        type: "timer",
        content: {
          title: "⏰ Oferta por tempo limitado!",
          subtitle: "Não perca esta oportunidade única!",
          days: 0,
          hours: 23,
          minutes: 59,
          seconds: 59,
          textColor: "#dc2626",
          bgColor: "#fef2f2",
          borderColor: "#fecaca",
        },
        position: { x: 0, y: 1 },
        order: 1,
      },
      {
        id: "benefits-1",
        type: "benefits",
        content: {
          title: "✅ O que você vai receber:",
          items: [
            "✓ Acesso vitalício ao conteúdo",
            "✓ Certificado de conclusão",
            "✓ Suporte por email",
            "✓ Atualizações gratuitas",
            "✓ Garantia de 7 dias",
            "✓ Bônus exclusivos",
          ],
          color: "#059669",
          titleColor: "#1f2937",
        },
        position: { x: 0, y: 2 },
        order: 2,
      },
      {
        id: "testimonial-1",
        type: "testimonial",
        content: {
          name: "Maria Silva",
          text: "Este produto mudou completamente minha vida! Recomendo para todos que querem resultados reais.",
          avatar: "/placeholder.svg?height=60&width=60",
          rating: 5,
          region: "São Paulo, SP",
          bgColor: "#eff6ff",
          textColor: "#1e40af",
          nameColor: "#1f2937",
          regionColor: "#6b7280",
        },
        position: { x: 0, y: 3 },
        order: 3,
      },
      {
        id: "testimonial-2",
        type: "testimonial",
        content: {
          name: "João Santos",
          text: "Incrível! Superou todas as minhas expectativas. Conteúdo de altíssima qualidade.",
          avatar: "/placeholder.svg?height=60&width=60",
          rating: 5,
          region: "Rio de Janeiro, RJ",
          bgColor: "#f0fdf4",
          textColor: "#166534",
          nameColor: "#1f2937",
          regionColor: "#6b7280",
        },
        position: { x: 0, y: 4 },
        order: 4,
      },
    ]

    setElements(defaultElements)
  }

  const addElement = useCallback(
    (type: string) => {
      const newElement: CheckoutElement = {
        id: Date.now().toString(),
        type,
        content: getDefaultContent(type),
        position: { x: 0, y: 0 },
        order: elements.length,
      }
      setElements([...elements, newElement])
    },
    [elements],
  )

  const getDefaultContent = (type: string) => {
    switch (type) {
      case "text":
        return { text: "Seu texto aqui", fontSize: 16, color: "#000000", align: "left" }
      case "image":
        return { src: "/placeholder.svg?height=200&width=300", alt: "Imagem", width: 300, height: 200 }
      case "benefits":
        return {
          title: "✅ Benefícios",
          items: ["✓ Benefício 1", "✓ Benefício 2", "✓ Benefício 3"],
          color: "#059669",
          titleColor: "#1f2937",
        }
      case "timer":
        return {
          title: "⏰ Oferta por tempo limitado!",
          subtitle: "Não perca esta oportunidade única!",
          days: 0,
          hours: 23,
          minutes: 59,
          seconds: 59,
          textColor: "#dc2626",
          bgColor: "#fef2f2",
          borderColor: "#fecaca",
        }
      case "testimonial":
        return {
          name: "Cliente Satisfeito",
          text: "Este produto mudou minha vida!",
          avatar: "/placeholder.svg?height=60&width=60",
          rating: 5,
          region: "São Paulo, SP",
          bgColor: "#eff6ff",
          textColor: "#1e40af",
          nameColor: "#1f2937",
          regionColor: "#6b7280",
        }
      case "header":
        return {
          title: "Título Principal",
          subtitle: "Subtítulo opcional",
          titleColor: "#1f2937",
          subtitleColor: "#6b7280",
        }
      default:
        return {}
    }
  }

  const updateElement = useCallback(
    (id: string, content: any) => {
      setElements(elements.map((el) => (el.id === id ? { ...el, content } : el)))
    },
    [elements],
  )

  const removeElement = useCallback(
    (id: string) => {
      setElements(elements.filter((el) => el.id !== id))
      setSelectedElement(null)
    },
    [elements],
  )

  const moveElement = useCallback(
    (id: string, direction: "up" | "down") => {
      const elementIndex = elements.findIndex((el) => el.id === id)
      if (elementIndex === -1) return

      const newElements = [...elements]
      const targetIndex = direction === "up" ? elementIndex - 1 : elementIndex + 1

      if (targetIndex >= 0 && targetIndex < elements.length) {
        ;[newElements[elementIndex], newElements[targetIndex]] = [newElements[targetIndex], newElements[elementIndex]]
        setElements(newElements)
      }
    },
    [elements],
  )

  const saveCheckout = async () => {
    try {
      console.log("💾 Salvando checkout...")
      const checkoutData = {
        productId: params.id,
        elements,
        settings: checkoutSettings,
        paymentMethods,
      }

      const response = await fetch(`/api/products/${params.id}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Checkout salvo:", data.checkout.id)
        toast({
          title: "Checkout salvo com sucesso!",
          description: `Checkout personalizado do produto ${product.name} foi salvo.`,
        })

        // Recarregar dados salvos após salvar
        await loadSavedCheckout()
      } else {
        throw new Error("Erro na resposta do servidor")
      }
    } catch (error) {
      console.error("❌ Erro ao salvar checkout:", error)
      toast({
        title: "Erro ao salvar",
        description: "Erro interno do servidor",
        variant: "destructive",
      })
    }
  }

  const renderElement = (element: CheckoutElement) => {
    const { type, content } = element

    switch (type) {
      case "text":
        return (
          <div
            style={{
              fontSize: content.fontSize,
              color: content.color,
              textAlign: content.align,
              fontFamily: checkoutSettings.fontFamily,
            }}
            className="p-4 min-h-[40px] cursor-pointer hover:bg-gray-50 rounded"
          >
            {content.text}
          </div>
        )

      case "image":
        return (
          <div className="p-4 cursor-pointer hover:bg-gray-50 rounded flex justify-center">
            <ResizableImage
              content={content}
              onUpdate={(newContent) => updateElement(element.id, newContent)}
              isSelected={selectedElement === element.id}
            />
          </div>
        )

      case "benefits":
        return (
          <div className="p-6 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100">
            <h3
              className="font-bold text-xl mb-4"
              style={{ fontFamily: checkoutSettings.fontFamily, color: content.titleColor || "#1f2937" }}
            >
              {content.title}
            </h3>
            <ul className="space-y-3">
              {content.items.map((item: string, index: number) => (
                <li key={index} className="flex items-center space-x-3">
                  <span
                    className="text-lg font-semibold"
                    style={{ color: content.color, fontFamily: checkoutSettings.fontFamily }}
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
          <div className="cursor-pointer hover:opacity-90">
            <CountdownTimer content={content} isEditing={selectedElement === element.id} />
          </div>
        )

      case "testimonial":
        return (
          <div className="p-6 rounded-lg cursor-pointer hover:opacity-90" style={{ backgroundColor: content.bgColor }}>
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
                  style={{ fontFamily: checkoutSettings.fontFamily, color: content.textColor }}
                >
                  "{content.text}"
                </p>
                <p
                  className="font-semibold text-lg"
                  style={{ fontFamily: checkoutSettings.fontFamily, color: content.nameColor }}
                >
                  {content.name}
                </p>
                {content.region && (
                  <p
                    className="text-sm"
                    style={{ fontFamily: checkoutSettings.fontFamily, color: content.regionColor }}
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
          <div className="p-6 text-center cursor-pointer hover:bg-gray-50 rounded">
            <h1
              className="text-4xl font-bold mb-3"
              style={{ color: content.titleColor, fontFamily: checkoutSettings.fontFamily }}
            >
              {content.title}
            </h1>
            {content.subtitle && (
              <p className="text-xl" style={{ color: content.subtitleColor, fontFamily: checkoutSettings.fontFamily }}>
                {content.subtitle}
              </p>
            )}
          </div>
        )

      default:
        return (
          <div className="p-4 border border-dashed border-gray-300 bg-gray-50 rounded cursor-pointer">
            <p className="text-gray-600" style={{ fontFamily: checkoutSettings.fontFamily }}>
              Elemento: {type}
            </p>
          </div>
        )
    }
  }

  // Filtrar métodos de pagamento habilitados
  const enabledPaymentMethods = paymentMethods.filter((method) => method.enabled)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Link href={`/dashboard/products/${params.id}/edit`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Checkout Builder</h2>
              <p className="text-sm text-gray-600">Produto: {product.name}</p>
            </div>

            <Tabs defaultValue="elements" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="elements">Elementos</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
              </TabsList>

              <TabsContent value="elements" className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">ADICIONAR ELEMENTOS</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {ELEMENT_TYPES.map(({ type, icon: Icon, label }) => (
                      <Button
                        key={type}
                        variant="outline"
                        className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-gray-50"
                        onClick={() => addElement(type)}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">ELEMENTOS ATUAIS</h3>
                  <div className="space-y-2">
                    {elements.map((element, index) => (
                      <div
                        key={element.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedElement === element.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedElement(element.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Move className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium capitalize">{element.type}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                moveElement(element.id, "up")
                              }}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                moveElement(element.id, "down")
                              }}
                              disabled={index === elements.length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeElement(element.id)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Fonte Principal</Label>
                    <Select
                      value={checkoutSettings.fontFamily}
                      onValueChange={(value) => setCheckoutSettings({ ...checkoutSettings, fontFamily: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Cor Primária</Label>
                      <Input
                        type="color"
                        value={checkoutSettings.primaryColor}
                        onChange={(e) => setCheckoutSettings({ ...checkoutSettings, primaryColor: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label>Cor do Botão</Label>
                      <Input
                        type="color"
                        value={checkoutSettings.buttonBgColor}
                        onChange={(e) => setCheckoutSettings({ ...checkoutSettings, buttonBgColor: e.target.value })}
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Checkout: {product.name}</h1>
              <Badge variant="outline">
                {elements.length} elemento{elements.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={previewMode === "desktop" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode("desktop")}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </Button>
              <Button
                variant={previewMode === "mobile" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode("mobile")}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </Button>

              <div className="border-l border-gray-300 pl-2 ml-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button size="sm" onClick={saveCheckout} className="ml-2">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas - Layout estilo Cakto */}
          <div className="flex-1 bg-gray-100 p-6 overflow-auto">
            <div
              className={`mx-auto bg-white shadow-xl rounded-lg overflow-hidden ${
                previewMode === "mobile" ? "max-w-md" : "max-w-6xl"
              }`}
              style={{ fontFamily: checkoutSettings.fontFamily }}
            >
              <div className={`${previewMode === "mobile" ? "block" : "grid grid-cols-3 gap-0"}`}>
                {/* Coluna Principal - Elementos Personalizáveis */}
                <div className={`${previewMode === "mobile" ? "order-1" : "col-span-2"} p-6 space-y-6`}>
                  {/* Elementos Dinâmicos */}
                  {elements.map((element, index) => (
                    <div
                      key={element.id}
                      className={`relative group ${
                        selectedElement === element.id ? "ring-2 ring-blue-500 rounded" : ""
                      }`}
                      onClick={() => setSelectedElement(element.id)}
                    >
                      {renderElement(element)}

                      {/* Element Controls */}
                      {selectedElement === element.id && (
                        <div className="absolute top-2 right-2 flex space-x-1 bg-white rounded shadow-lg p-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedElement(element.id)
                            }}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeElement(element.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Formulário de Dados */}
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
                          <Input placeholder="Nome do comprador" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Email</Label>
                          <Input type="email" placeholder="email@email.com" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">CPF</Label>
                          <Input placeholder="304.761.060-23" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Celular</Label>
                          <Input placeholder="+55 (99) 99999-9999" className="mt-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Métodos de Pagamento */}
                  <Card className="border-2 border-gray-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-2">
                        <span>💳</span>
                        <span>Pagamento</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {enabledPaymentMethods.map((method) => (
                          <Button
                            key={method.id}
                            variant="outline"
                            className="h-16 flex flex-col items-center justify-center space-y-1 border-2 hover:border-green-500"
                          >
                            {method.id === "apple_pay" && <Apple className="h-6 w-6" />}
                            {method.id === "google_pay" && <Phone className="h-6 w-6" />}
                            {method.id === "pix" && <span className="text-2xl">💳</span>}
                            {method.id === "credit_card" && <CreditCard className="h-6 w-6" />}
                            {method.id === "boleto" && <span className="text-2xl">📄</span>}
                            <span className="text-xs font-medium">{method.name}</span>
                          </Button>
                        ))}
                      </div>

                      {/* Formulário de Cartão */}
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
                              <SelectValue placeholder="1 x de R$ 247,90" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1x de R$ {product.price.toFixed(2)} à vista</SelectItem>
                              <SelectItem value="2">2x de R$ {(product.price / 2).toFixed(2)}</SelectItem>
                              <SelectItem value="3">3x de R$ {(product.price / 3).toFixed(2)}</SelectItem>
                              <SelectItem value="6">6x de R$ {(product.price / 6).toFixed(2)}</SelectItem>
                              <SelectItem value="12">12x de R$ {(product.price / 12).toFixed(2)}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="save-card" className="rounded" />
                          <Label htmlFor="save-card" className="text-sm">
                            Salvar dados para as próximas compras
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resumo do Pedido Mobile */}
                  {previewMode === "mobile" && (
                    <Card className="border-2 border-gray-200">
                      <CardHeader>
                        <CardTitle>Resumo do pedido</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4 mb-4">
                          <img
                            src={product.image || "/placeholder.svg?height=60&width=60"}
                            alt={product.name}
                            className="w-15 h-15 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-gray-600">1 x de R$ {product.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Total</span>
                            <span className="text-xl font-bold text-green-600">R$ {product.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Botão de Compra */}
                  <Button
                    className="w-full h-14 text-lg font-bold"
                    style={{
                      backgroundColor: checkoutSettings.buttonBgColor,
                      color: checkoutSettings.buttonTextColor,
                    }}
                  >
                    Pagar com Cartão de Crédito
                  </Button>

                  {/* Segurança */}
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4" />
                      <span>Os seus dados de pagamento são criptografados e processados de forma segura.</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>Este site é processado pela Cakto</p>
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
                {previewMode === "desktop" && (
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
                            src={product.image || "/placeholder.svg?height=80&width=80"}
                            alt={product.name}
                            className="w-20 h-20 rounded object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg?height=80&width=80"
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <p className="text-sm text-gray-600">1 x de R$ {product.price.toFixed(2)}</p>
                            <p className="text-xs text-blue-600 underline cursor-pointer">Veja o resumo do conteúdo</p>
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between">
                            <span className="font-semibold text-lg">Total</span>
                            <span className="text-xl font-bold">R$ {product.price.toFixed(2)}</span>
                          </div>
                          <p className="text-sm text-gray-600">ou R$ {product.price.toFixed(2)} à vista</p>
                          <p className="text-xs text-gray-500">Parcelamento disponível</p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg mb-6">
                          <div className="flex items-center space-x-2 mb-2">
                            <Shield className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-800">Cakto</span>
                          </div>
                          <p className="text-xs text-green-700">
                            Cakto está processando este pagamento para o vendedor Gabriel Medeiros
                          </p>
                        </div>

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
                          <p>* Parcelamento sem acréscimo</p>
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
          </div>
        </div>

        {/* Properties Panel */}
        {selectedElement && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Propriedades</h3>
              <ElementProperties
                element={elements.find((el) => el.id === selectedElement)!}
                onUpdate={(content) => updateElement(selectedElement, content)}
                settings={checkoutSettings}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

// Component for editing element properties
function ElementProperties({
  element,
  onUpdate,
  settings,
}: {
  element: CheckoutElement
  onUpdate: (content: any) => void
  settings: CheckoutSettings
}) {
  const { type, content } = element

  switch (type) {
    case "text":
      return (
        <div className="space-y-4">
          <div>
            <Label>Texto</Label>
            <Textarea value={content.text} onChange={(e) => onUpdate({ ...content, text: e.target.value })} />
          </div>
          <div>
            <Label>Tamanho da Fonte</Label>
            <Input
              type="number"
              value={content.fontSize}
              onChange={(e) => onUpdate({ ...content, fontSize: Number.parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label>Cor</Label>
            <Input
              type="color"
              value={content.color}
              onChange={(e) => onUpdate({ ...content, color: e.target.value })}
            />
          </div>
          <div>
            <Label>Alinhamento</Label>
            <Select value={content.align} onValueChange={(value) => onUpdate({ ...content, align: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Esquerda</SelectItem>
                <SelectItem value="center">Centro</SelectItem>
                <SelectItem value="right">Direita</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )

    case "image":
      return (
        <div className="space-y-4">
          <div>
            <Label>Imagem</Label>
            <ImageUploader
              onImageUpload={(src: string) => onUpdate({ ...content, src })}
              currentImage={content.src}
              className="h-32"
            />
          </div>
          <div>
            <Label>Texto Alternativo</Label>
            <Input value={content.alt} onChange={(e) => onUpdate({ ...content, alt: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Largura (px)</Label>
              <Input
                type="number"
                min="100"
                max="800"
                value={content.width}
                onChange={(e) => onUpdate({ ...content, width: Number.parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Altura (px)</Label>
              <Input
                type="number"
                min="100"
                max="600"
                value={content.height}
                onChange={(e) => onUpdate({ ...content, height: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <p>💡 Dica: Clique e arraste os pontos azuis na imagem para redimensionar visualmente</p>
            <p>Limites: 100-800px (largura) e 100-600px (altura)</p>
          </div>
        </div>
      )

    case "benefits":
      return (
        <div className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input value={content.title} onChange={(e) => onUpdate({ ...content, title: e.target.value })} />
          </div>
          <div>
            <Label>Cor do Título</Label>
            <Input
              type="color"
              value={content.titleColor || "#1f2937"}
              onChange={(e) => onUpdate({ ...content, titleColor: e.target.value })}
            />
          </div>
          <div>
            <Label>Cor dos Itens</Label>
            <Input
              type="color"
              value={content.color}
              onChange={(e) => onUpdate({ ...content, color: e.target.value })}
            />
          </div>
          <div>
            <Label>Benefícios</Label>
            {content.items.map((item: string, index: number) => (
              <div key={index} className="flex space-x-2 mb-2">
                <Input
                  value={item}
                  onChange={(e) => {
                    const newItems = [...content.items]
                    newItems[index] = e.target.value
                    onUpdate({ ...content, items: newItems })
                  }}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const newItems = content.items.filter((_: any, i: number) => i !== index)
                    onUpdate({ ...content, items: newItems })
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onUpdate({
                  ...content,
                  items: [...content.items, "✓ Novo benefício"],
                })
              }
              className="w-full mt-2"
            >
              Adicionar Benefício
            </Button>
          </div>
        </div>
      )

    case "testimonial":
      return (
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Foto do Cliente</Label>
            <ImageUploader
              onImageUpload={(src: string) => onUpdate({ ...content, avatar: src })}
              currentImage={content.avatar}
              small={true}
            />
          </div>
          <div>
            <Label>Nome</Label>
            <Input value={content.name} onChange={(e) => onUpdate({ ...content, name: e.target.value })} />
          </div>
          <div>
            <Label>Região/Cidade</Label>
            <Input
              value={content.region || ""}
              onChange={(e) => onUpdate({ ...content, region: e.target.value })}
              placeholder="São Paulo, SP"
            />
          </div>
          <div>
            <Label>Depoimento</Label>
            <Textarea value={content.text} onChange={(e) => onUpdate({ ...content, text: e.target.value })} />
          </div>
          <div>
            <Label>Avaliação (1-5 estrelas)</Label>
            <Input
              type="number"
              min="1"
              max="5"
              value={content.rating}
              onChange={(e) => onUpdate({ ...content, rating: Number.parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label>Cor de Fundo</Label>
            <Input
              type="color"
              value={content.bgColor}
              onChange={(e) => onUpdate({ ...content, bgColor: e.target.value })}
            />
          </div>
          <div>
            <Label>Cor do Texto</Label>
            <Input
              type="color"
              value={content.textColor}
              onChange={(e) => onUpdate({ ...content, textColor: e.target.value })}
            />
          </div>
          <div>
            <Label>Cor do Nome</Label>
            <Input
              type="color"
              value={content.nameColor}
              onChange={(e) => onUpdate({ ...content, nameColor: e.target.value })}
            />
          </div>
          <div>
            <Label>Cor da Região</Label>
            <Input
              type="color"
              value={content.regionColor}
              onChange={(e) => onUpdate({ ...content, regionColor: e.target.value })}
            />
          </div>
        </div>
      )

    case "timer":
      return (
        <div className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input value={content.title} onChange={(e) => onUpdate({ ...content, title: e.target.value })} />
          </div>
          <div>
            <Label>Subtítulo</Label>
            <Input
              value={content.subtitle || ""}
              onChange={(e) => onUpdate({ ...content, subtitle: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Dias</Label>
              <Input
                type="number"
                min="0"
                value={content.days || 0}
                onChange={(e) => onUpdate({ ...content, days: Number.parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Horas</Label>
              <Input
                type="number"
                min="0"
                max="23"
                value={content.hours || 23}
                onChange={(e) => onUpdate({ ...content, hours: Number.parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Minutos</Label>
              <Input
                type="number"
                min="0"
                max="59"
                value={content.minutes || 59}
                onChange={(e) => onUpdate({ ...content, minutes: Number.parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Segundos</Label>
              <Input
                type="number"
                min="0"
                max="59"
                value={content.seconds || 45}
                onChange={(e) => onUpdate({ ...content, seconds: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label>Cor do Texto</Label>
            <Input
              type="color"
              value={content.textColor}
              onChange={(e) => onUpdate({ ...content, textColor: e.target.value })}
            />
          </div>
          <div>
            <Label>Cor de Fundo</Label>
            <Input
              type="color"
              value={content.bgColor}
              onChange={(e) => onUpdate({ ...content, bgColor: e.target.value })}
            />
          </div>
          <div>
            <Label>Cor da Borda</Label>
            <Input
              type="color"
              value={content.borderColor}
              onChange={(e) => onUpdate({ ...content, borderColor: e.target.value })}
            />
          </div>
        </div>
      )

    case "header":
      return (
        <div className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input value={content.title} onChange={(e) => onUpdate({ ...content, title: e.target.value })} />
          </div>
          <div>
            <Label>Subtítulo</Label>
            <Input value={content.subtitle} onChange={(e) => onUpdate({ ...content, subtitle: e.target.value })} />
          </div>
          <div>
            <Label>Cor do Título</Label>
            <Input
              type="color"
              value={content.titleColor}
              onChange={(e) => onUpdate({ ...content, titleColor: e.target.value })}
            />
          </div>
          <div>
            <Label>Cor do Subtítulo</Label>
            <Input
              type="color"
              value={content.subtitleColor}
              onChange={(e) => onUpdate({ ...content, subtitleColor: e.target.value })}
            />
          </div>
        </div>
      )

    default:
      return <div className="text-gray-500">Propriedades para {type} em desenvolvimento</div>
  }
}
