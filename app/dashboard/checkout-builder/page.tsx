"use client"

import React from "react"

import type { FunctionComponent } from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Facebook,
  Map,
  X,
  Bell,
  MessageCircle,
  Save,
  Eye,
  Smartphone,
  Monitor,
  Upload,
  Copy,
  Trash2,
  CreditCard,
  Phone,
  Shield,
  Apple,
  Star,
} from "lucide-react"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { useToast } from "@/hooks/use-toast"

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
  { type: "facebook", icon: Facebook, label: "Facebook", category: "content" },
  { type: "map", icon: Map, label: "Mapa", category: "content" },
  { type: "popup", icon: X, label: "Exit Popup", category: "extras" },
  { type: "notification", icon: Bell, label: "Notificação", category: "extras" },
  { type: "chat", icon: MessageCircle, label: "Chat", category: "extras" },
]

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Poppins", label: "Poppins" },
]

// Componente para redimensionar imagens
const ResizableImage: FunctionComponent<any> = ({ src, alt, width, height, onResize, className = "" }: any) => {
  const [isResizing, setIsResizing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [startSize, setStartSize] = useState({ width: 0, height: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setStartPos({ x: e.clientX, y: e.clientY })
    setStartSize({ width: width || 60, height: height || 60 })
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return

      const deltaX = e.clientX - startPos.x
      const deltaY = e.clientY - startPos.y

      const newWidth = Math.max(40, startSize.width + deltaX)
      const newHeight = Math.max(40, startSize.height + deltaY)

      if (onResize) {
        onResize(newWidth, newHeight)
      }
    },
    [isResizing, startPos, startSize, onResize],
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  React.useEffect(() => {
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
    <div className={`relative inline-block ${className}`}>
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        style={{ width: width || 60, height: height || 60 }}
        className="rounded object-cover"
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize opacity-70 hover:opacity-100 rounded-full"
        onMouseDown={handleMouseDown}
        style={{ transform: "translate(50%, 50%)" }}
      />
    </div>
  )
}

// Componente para upload de imagem com drag and drop
const ImageUploader: FunctionComponent<any> = ({ onImageUpload, currentImage, className = "", small = false }: any) => {
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
          onImageUpload(e.target?.result as string)
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
        onImageUpload(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
        isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-600 hover:border-gray-500"
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
          />
          <p className="text-xs text-gray-400 mt-1">Clique ou arraste para alterar</p>
        </div>
      ) : (
        <div>
          <Upload className={`text-gray-400 mx-auto mb-2 ${small ? "h-6 w-6" : "h-8 w-8"}`} />
          <p className={`text-gray-400 ${small ? "text-xs" : "text-sm"}`}>
            {small ? "Arraste ou clique" : "Arraste uma imagem ou clique para selecionar"}
          </p>
          {!small && <p className="text-xs text-gray-500">JPG, PNG até 10MB</p>}
        </div>
      )}
    </div>
  )
}

export default function CheckoutBuilderPage() {
  const [elements, setElements] = useState<CheckoutElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [bannerImage, setBannerImage] = useState<string | null>(null)
  const [bannerSize, setBannerSize] = useState({ width: 800, height: 200 })
  const [checkoutSettings, setCheckoutSettings] = useState<CheckoutSettings>({
    fontFamily: "Inter",
    primaryColor: "#3b82f6", // Azul do site
    secondaryColor: "#64748b", // Cinza do site
    activeColor: "#2563eb", // Azul ativo
    iconColor: "#6366f1", // Roxo do site
    formBgColor: "#f8fafc", // Fundo claro
    buttonTextColor: "#ffffff",
    buttonBgColor: "#3b82f6", // Azul do site
    buttonIconColor: "#ffffff",
    selectedButtonBg: "#3b82f6",
    unselectedButtonBg: "#f1f5f9",
  })

  const { toast } = useToast()

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
          title: "Benefícios",
          items: ["✓ Benefício 1", "✓ Benefício 2", "✓ Benefício 3"],
          color: "#16a34a",
        }
      case "timer":
        return {
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          title: "Oferta por tempo limitado!",
          textColor: "#dc2626",
          bgColor: "#fef2f2",
          borderColor: "#fecaca",
          days: 0,
          hours: 23,
          minutes: 59,
          seconds: 45,
        }
      case "testimonial":
        return {
          name: "João Silva",
          text: "Este produto mudou minha vida!",
          avatar: "/placeholder.svg?height=50&width=50",
          rating: 5,
          region: "São Paulo, SP",
          bgColor: "#eff6ff",
          textColor: "#1e40af",
          nameColor: "#1f2937",
          regionColor: "#6b7280",
        }
      case "video":
        return {
          url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          title: "Vídeo de apresentação",
          width: 560,
          height: 315,
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
      const checkoutData = {
        elements,
        settings: checkoutSettings,
        bannerImage,
        bannerSize,
        timestamp: new Date().toISOString(),
      }

      const response = await fetch("/api/checkout-builder/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(checkoutData),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Checkout salvo com sucesso!",
          description: `Link público: ${data.publicUrl}`,
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Erro interno do servidor",
        variant: "destructive",
      })
    }
  }

  const copyFromDesktop = () => {
    toast({
      title: "Layout copiado",
      description: "O layout desktop foi copiado para mobile",
    })
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
            className="p-2 min-h-[40px] cursor-pointer hover:bg-gray-50 rounded"
          >
            {content.text}
          </div>
        )

      case "image":
        return (
          <div className="p-2 cursor-pointer hover:bg-gray-50 rounded">
            <ResizableImage
              src={content.src}
              alt={content.alt}
              width={content.width}
              height={content.height}
              onResize={(width: number, height: number) => {
                updateElement(element.id, { ...content, width, height })
              }}
            />
          </div>
        )

      case "benefits":
        return (
          <div className="p-4 bg-green-50 rounded cursor-pointer hover:bg-green-100">
            <h3
              className="font-bold text-lg mb-2"
              style={{ fontFamily: checkoutSettings.fontFamily, color: content.titleColor || "#000" }}
            >
              {content.title}
            </h3>
            <ul className="space-y-1">
              {content.items.map((item: string, index: number) => (
                <li key={index} className="flex items-center space-x-2">
                  <span style={{ color: content.color, fontFamily: checkoutSettings.fontFamily }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )

      case "timer":
        return (
          <div
            className="p-4 rounded text-center cursor-pointer hover:opacity-90"
            style={{
              backgroundColor: content.bgColor,
              borderColor: content.borderColor,
              border: `2px solid ${content.borderColor}`,
            }}
          >
            <h3
              className="font-bold text-lg mb-4"
              style={{ color: content.textColor, fontFamily: checkoutSettings.fontFamily }}
            >
              {content.title}
            </h3>
            <div className="flex justify-center space-x-2 text-2xl font-mono mb-2">
              <div className="flex flex-col items-center">
                <div className="bg-black text-white px-3 py-2 rounded min-w-[50px]">{content.days || 0}</div>
                <span className="text-xs mt-1" style={{ color: content.textColor }}>
                  DIAS
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-black text-white px-3 py-2 rounded min-w-[50px]">{content.hours || 23}</div>
                <span className="text-xs mt-1" style={{ color: content.textColor }}>
                  HORAS
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-black text-white px-3 py-2 rounded min-w-[50px]">{content.minutes || 59}</div>
                <span className="text-xs mt-1" style={{ color: content.textColor }}>
                  MIN
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-black text-white px-3 py-2 rounded min-w-[50px]">{content.seconds || 45}</div>
                <span className="text-xs mt-1" style={{ color: content.textColor }}>
                  SEG
                </span>
              </div>
            </div>
          </div>
        )

      case "testimonial":
        return (
          <div className="p-4 rounded cursor-pointer hover:opacity-90" style={{ backgroundColor: content.bgColor }}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <ResizableImage
                  src={content.avatar}
                  alt={content.name}
                  width={content.avatarWidth || 60}
                  height={content.avatarHeight || 60}
                  onResize={(width: number, height: number) => {
                    updateElement(element.id, { ...content, avatarWidth: width, avatarHeight: height })
                  }}
                  className="rounded-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < content.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <p
                  className="italic mb-2"
                  style={{ fontFamily: checkoutSettings.fontFamily, color: content.textColor }}
                >
                  "{content.text}"
                </p>
                <p
                  className="font-semibold"
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

      case "video":
        return (
          <div className="p-4 cursor-pointer hover:bg-gray-50 rounded">
            <h3 className="font-semibold mb-2" style={{ fontFamily: checkoutSettings.fontFamily }}>
              {content.title}
            </h3>
            <ResizableImage
              src="/placeholder.svg?height=315&width=560"
              alt="Video placeholder"
              width={content.width}
              height={content.height}
              onResize={(width: number, height: number) => {
                updateElement(element.id, { ...content, width, height })
              }}
            />
          </div>
        )

      case "header":
        return (
          <div className="p-4 text-center cursor-pointer hover:bg-gray-50 rounded">
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: content.titleColor, fontFamily: checkoutSettings.fontFamily }}
            >
              {content.title}
            </h1>
            {content.subtitle && (
              <p className="text-lg" style={{ color: content.subtitleColor, fontFamily: checkoutSettings.fontFamily }}>
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

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-gray-900">
        {/* Sidebar - Dark Theme */}
        <div className="w-80 bg-gray-800 text-white overflow-y-auto">
          <div className="p-4">
            <Tabs defaultValue="elements" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger value="elements" className="text-white data-[state=active]:bg-gray-600">
                  Elementos
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-white data-[state=active]:bg-gray-600">
                  Configurações
                </TabsTrigger>
              </TabsList>

              <TabsContent value="elements" className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-300">CONTEÚDO</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {ELEMENT_TYPES.filter((el) => el.category === "content").map(({ type, icon: Icon, label }) => (
                      <Button
                        key={type}
                        variant="outline"
                        className="h-16 flex flex-col items-center justify-center space-y-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                        onClick={() => addElement(type)}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-300">EXTRAS</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {ELEMENT_TYPES.filter((el) => el.category === "extras").map(({ type, icon: Icon, label }) => (
                      <Button
                        key={type}
                        variant="outline"
                        className="h-16 flex flex-col items-center justify-center space-y-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                        onClick={() => addElement(type)}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Fonte Principal</Label>
                    <Select
                      value={checkoutSettings.fontFamily}
                      onValueChange={(value) => setCheckoutSettings({ ...checkoutSettings, fontFamily: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
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
                      <Label className="text-gray-300">Cor Primária</Label>
                      <Input
                        type="color"
                        value={checkoutSettings.primaryColor}
                        onChange={(e) => setCheckoutSettings({ ...checkoutSettings, primaryColor: e.target.value })}
                        className="h-10 bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Cor Secundária</Label>
                      <Input
                        type="color"
                        value={checkoutSettings.secondaryColor}
                        onChange={(e) => setCheckoutSettings({ ...checkoutSettings, secondaryColor: e.target.value })}
                        className="h-10 bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Cor Ativa</Label>
                      <Input
                        type="color"
                        value={checkoutSettings.activeColor}
                        onChange={(e) => setCheckoutSettings({ ...checkoutSettings, activeColor: e.target.value })}
                        className="h-10 bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Cor dos Ícones</Label>
                      <Input
                        type="color"
                        value={checkoutSettings.iconColor}
                        onChange={(e) => setCheckoutSettings({ ...checkoutSettings, iconColor: e.target.value })}
                        className="h-10 bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Fundo do Formulário</Label>
                    <Input
                      type="color"
                      value={checkoutSettings.formBgColor}
                      onChange={(e) => setCheckoutSettings({ ...checkoutSettings, formBgColor: e.target.value })}
                      className="h-10 bg-gray-700 border-gray-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-gray-300">Botão Selecionado</Label>
                      <Input
                        type="color"
                        value={checkoutSettings.selectedButtonBg}
                        onChange={(e) => setCheckoutSettings({ ...checkoutSettings, selectedButtonBg: e.target.value })}
                        className="h-10 bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Botão Normal</Label>
                      <Input
                        type="color"
                        value={checkoutSettings.unselectedButtonBg}
                        onChange={(e) =>
                          setCheckoutSettings({ ...checkoutSettings, unselectedButtonBg: e.target.value })
                        }
                        className="h-10 bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {/* Toolbar */}
          <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-white">Checkout Builder</h1>
              <Badge variant="outline" className="text-gray-300 border-gray-600">
                {elements.length} elemento{elements.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={previewMode === "desktop" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode("desktop")}
                className="text-white border-gray-600"
              >
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </Button>
              <Button
                variant={previewMode === "mobile" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode("mobile")}
                className="text-white border-gray-600"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </Button>

              {previewMode === "mobile" && (
                <Button variant="outline" size="sm" onClick={copyFromDesktop} className="text-white border-gray-600">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar do Desktop
                </Button>
              )}

              <div className="border-l border-gray-600 pl-2 ml-2">
                <Button variant="outline" size="sm" className="text-white border-gray-600">
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

          {/* Canvas */}
          <div className="flex-1 bg-gray-900 p-6 overflow-auto">
            <div
              className={`mx-auto bg-white shadow-2xl rounded-lg min-h-screen relative ${
                previewMode === "mobile" ? "max-w-sm" : "max-w-4xl"
              }`}
              style={{ fontFamily: checkoutSettings.fontFamily }}
            >
              {/* Banner Upload Area */}
              <div className="relative">
                {bannerImage ? (
                  <div className="relative">
                    <ResizableImage
                      src={bannerImage}
                      alt="Banner"
                      width={bannerSize.width}
                      height={bannerSize.height}
                      onResize={(width: number, height: number) => {
                        setBannerSize({ width, height })
                      }}
                      className="w-full object-cover rounded-t-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setBannerImage(null)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <ImageUploader
                    onImageUpload={setBannerImage}
                    currentImage={bannerImage}
                    className="h-48 rounded-t-lg"
                  />
                )}
              </div>

              {/* Checkout Content */}
              <div className="p-6">
                {/* Product Header */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold mb-2" style={{ color: checkoutSettings.primaryColor }}>
                    Curso Completo de Marketing Digital
                  </h1>
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <span className="text-3xl font-bold text-green-600">R$ 197,00</span>
                    <span className="text-lg text-gray-500 line-through">R$ 397,00</span>
                    <Badge className="bg-red-100 text-red-800">50% OFF</Badge>
                  </div>
                  <p className="text-gray-600">ou 12x de R$ 19,70 no cartão</p>
                </div>

                {/* Dynamic Elements */}
                <div className="space-y-4 mb-8">
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
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
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
                          variant="outline"
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
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeElement(element.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout Form */}
                <Card style={{ backgroundColor: checkoutSettings.formBgColor }}>
                  <CardHeader>
                    <CardTitle style={{ color: checkoutSettings.primaryColor }}>
                      Dados para Finalizar a Compra
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Customer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome Completo</Label>
                        <Input placeholder="Seu nome completo" />
                      </div>
                      <div>
                        <Label>E-mail</Label>
                        <Input type="email" placeholder="seu@email.com" />
                      </div>
                      <div>
                        <Label>CPF</Label>
                        <Input placeholder="000.000.000-00" />
                      </div>
                      <div>
                        <Label>Celular</Label>
                        <Input placeholder="+55 (11) 99999-9999" />
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Forma de Pagamento</Label>

                      <Tabs defaultValue="pix" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="apple" className="flex items-center space-x-2">
                            <Apple className="h-4 w-4" />
                            <span className="hidden sm:inline">Apple Pay</span>
                          </TabsTrigger>
                          <TabsTrigger value="google" className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span className="hidden sm:inline">Google Pay</span>
                          </TabsTrigger>
                          <TabsTrigger value="pix" className="flex items-center space-x-2">
                            <span className="text-lg">💳</span>
                            <span className="hidden sm:inline">PIX</span>
                          </TabsTrigger>
                          <TabsTrigger value="card" className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4" />
                            <span className="hidden sm:inline">Cartão</span>
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="pix" className="space-y-4">
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-green-800 font-semibold">Pagamento via PIX</p>
                            <p className="text-sm text-green-600">Aprovação imediata</p>
                          </div>
                        </TabsContent>

                        <TabsContent value="card" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <Label>Número do Cartão</Label>
                              <Input placeholder="0000 0000 0000 0000" />
                            </div>
                            <div>
                              <Label>Validade</Label>
                              <Input placeholder="MM/AA" />
                            </div>
                            <div>
                              <Label>CVV</Label>
                              <Input placeholder="000" />
                            </div>
                            <div className="md:col-span-2">
                              <Label>Parcelas</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione as parcelas" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1x de R$ 197,00 à vista</SelectItem>
                                  <SelectItem value="2">2x de R$ 98,50</SelectItem>
                                  <SelectItem value="3">3x de R$ 65,67</SelectItem>
                                  <SelectItem value="6">6x de R$ 32,83</SelectItem>
                                  <SelectItem value="12">12x de R$ 19,70</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="apple" className="space-y-4">
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <Apple className="h-12 w-12 mx-auto mb-2" />
                            <p className="font-semibold">Apple Pay</p>
                            <p className="text-sm text-gray-600">Pagamento rápido e seguro</p>
                          </div>
                        </TabsContent>

                        <TabsContent value="google" className="space-y-4">
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <Phone className="h-12 w-12 mx-auto mb-2" />
                            <p className="font-semibold">Google Pay</p>
                            <p className="text-sm text-gray-600">Pagamento rápido e seguro</p>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* Checkbox and Security */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="save-data" className="rounded" />
                        <Label htmlFor="save-data" className="text-sm">
                          Salvar dados para as próximas compras
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Shield className="h-4 w-4" />
                        <span>Dados criptografados e processados com segurança</span>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <Card className="bg-gray-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">Curso Completo de Marketing Digital</h3>
                            <p className="text-sm text-gray-600">Acesso vitalício</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600">R$ 197,00</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Purchase Button */}
                    <Button
                      className="w-full h-12 text-lg font-semibold"
                      style={{
                        backgroundColor: checkoutSettings.buttonBgColor,
                        color: checkoutSettings.buttonTextColor,
                      }}
                    >
                      Finalizar Compra - R$ 197,00
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        {selectedElement && (
          <div className="w-80 bg-gray-800 text-white border-l border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4 text-white">Propriedades</h3>
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
            <Label className="text-gray-300">Texto</Label>
            <Textarea
              value={content.text}
              onChange={(e) => onUpdate({ ...content, text: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">Tamanho da Fonte</Label>
            <Input
              type="number"
              value={content.fontSize}
              onChange={(e) => onUpdate({ ...content, fontSize: Number.parseInt(e.target.value) })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">Cor</Label>
            <Input
              type="color"
              value={content.color}
              onChange={(e) => onUpdate({ ...content, color: e.target.value })}
              className="bg-gray-700 border-gray-600"
            />
          </div>
          <div>
            <Label className="text-gray-300">Alinhamento</Label>
            <Select value={content.align} onValueChange={(value) => onUpdate({ ...content, align: value })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
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
            <Label className="text-gray-300">Imagem</Label>
            <ImageUploader
              onImageUpload={(src: string) => onUpdate({ ...content, src })}
              currentImage={content.src}
              className="h-32"
            />
          </div>
          <div>
            <Label className="text-gray-300">Texto Alternativo</Label>
            <Input
              value={content.alt}
              onChange={(e) => onUpdate({ ...content, alt: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>
      )

    case "benefits":
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-gray-300">Título</Label>
            <Input
              value={content.title}
              onChange={(e) => onUpdate({ ...content, title: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">Cor do Título</Label>
            <Input
              type="color"
              value={content.titleColor || "#000000"}
              onChange={(e) => onUpdate({ ...content, titleColor: e.target.value })}
              className="bg-gray-700 border-gray-600"
            />
          </div>
          <div>
            <Label className="text-gray-300">Cor dos Itens</Label>
            <Input
              type="color"
              value={content.color}
              onChange={(e) => onUpdate({ ...content, color: e.target.value })}
              className="bg-gray-700 border-gray-600"
            />
          </div>
          <div>
            <Label className="text-gray-300">Benefícios</Label>
            {content.items.map((item: string, index: number) => (
              <div key={index} className="flex space-x-2">
                <Input
                  value={item}
                  onChange={(e) => {
                    const newItems = [...content.items]
                    newItems[index] = e.target.value
                    onUpdate({ ...content, items: newItems })
                  }}
                  className="bg-gray-700 border-gray-600 text-white"
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
              className="w-full mt-2 bg-gray-700 border-gray-600 text-white"
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
            <Label className="text-gray-300 mb-2 block">Foto do Cliente</Label>
            <ImageUploader
              onImageUpload={(src: string) => onUpdate({ ...content, avatar: src })}
              currentImage={content.avatar}
              className="bg-gray-700 border-gray-600"
              small={true}
            />
          </div>
          <div>
            <Label className="text-gray-300">Nome</Label>
            <Input
              value={content.name}
              onChange={(e) => onUpdate({ ...content, name: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">Região/Cidade</Label>
            <Input
              value={content.region || ""}
              onChange={(e) => onUpdate({ ...content, region: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="São Paulo, SP"
            />
          </div>
          <div>
            <Label className="text-gray-300">Depoimento</Label>
            <Textarea
              value={content.text}
              onChange={(e) => onUpdate({ ...content, text: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">Avaliação (1-5 estrelas)</Label>
            <Input
              type="number"
              min="1"
              max="5"
              value={content.rating}
              onChange={(e) => onUpdate({ ...content, rating: Number.parseInt(e.target.value) })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">Cor de Fundo</Label>
            <Input
              type="color"
              value={content.bgColor}
              onChange={(e) => onUpdate({ ...content, bgColor: e.target.value })}
              className="bg-gray-700 border-gray-600"
            />
          </div>
          <div>
            <Label className="text-gray-300">Cor do Texto</Label>
            <Input
              type="color"
              value={content.textColor}
              onChange={(e) => onUpdate({ ...content, textColor: e.target.value })}
              className="bg-gray-700 border-gray-600"
            />
          </div>
          <div>
            <Label className="text-gray-300">Cor do Nome</Label>
            <Input
              type="color"
              value={content.nameColor}
              onChange={(e) => onUpdate({ ...content, nameColor: e.target.value })}
              className="bg-gray-700 border-gray-600"
            />
          </div>
          <div>
            <Label className="text-gray-300">Cor da Região</Label>
            <Input
              type="color"
              value={content.regionColor}
              onChange={(e) => onUpdate({ ...content, regionColor: e.target.value })}
              className="bg-gray-700 border-gray-600"
            />
          </div>
        </div>
      )

    case "timer":
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-gray-300">Título</Label>
            <Input
              value={content.title}
              onChange={(e) => onUpdate({ ...content, title: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300">Dias</Label>
              <Input
                type="number"
                min="0"
                value={content.days || 0}
                onChange={(e) => onUpdate({ ...content, days: Number.parseInt(e.target.value) })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Horas</Label>
              <Input
                type="number"
                min="0"
                max="23"
                value={content.hours || 23}
                onChange={(e) => onUpdate({ ...content, hours: Number.parseInt(e.target.value) })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Minutos</Label>
              <Input
                type="number"
                min="0"
                max="59"
                value={content.minutes || 59}
                onChange={(e) => onUpdate({ ...content, minutes: Number.parseInt(e.target.value) })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Segundos</Label>
              <Input
                type="number"
                min="0"
                max="59"
                value={content.seconds || 45}
                onChange={(e) => onUpdate({ ...content, seconds: Number.parseInt(e.target.value) })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
          <div>
            <Label className="text-gray-300">Cor do Texto</Label>
            <Input
              type="color"
              value={content.textColor}
              onChange={(e) => onUpdate({ ...content, textColor: e.target.value })}
              className="bg-gray-700 border-gray-600"
            />
          </div>
          <div>
            <Label className="text-gray-300">Cor de Fundo</Label>
            <Input
              type="color"
              value={content.bgColor}
              onChange={(e) => onUpdate({ ...content, bgColor: e.target.value })}
              className="bg-gray-700 border-gray-600"
            />
          </div>
          <div>
            <Label className="text-gray-300">Cor da Borda</Label>
            <Input
              type="color"
              value={content.borderColor}
              onChange={(e) => onUpdate({ ...content, borderColor: e.target.value })}
              className="bg-gray-700 border-gray-600"
            />
          </div>
          <div>
            <Label className="text-gray-300">Data Final</Label>
            <Input
              type="datetime-local"
              value={content.endDate ? new Date(content.endDate).toISOString().slice(0, 16) : ""}
              onChange={(e) => onUpdate({ ...content, endDate: new Date(e.target.value).toISOString() })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>
      )

    case "header":
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-gray-300">Título</Label>
            <Input
              value={content.title}
              onChange={(e) => onUpdate({ ...content, title: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">Subtítulo</Label>
            <Input
              value={content.subtitle}
              onChange={(e) => onUpdate({ ...content, subtitle: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">Cor do Título</Label>
            <Input
              type="color"
              value={content.titleColor}
              onChange={(e) => onUpdate({ ...content, titleColor: e.target.value })}
              className="bg-gray-700 border-gray-600"
            />
          </div>
          <div>
            <Label className="text-gray-300">Cor do Subtítulo</Label>
            <Input
              type="color"
              value={content.subtitleColor}
              onChange={(e) => onUpdate({ ...content, subtitleColor: e.target.value })}
              className="bg-gray-700 border-gray-600"
            />
          </div>
        </div>
      )

    case "video":
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-gray-300">Título</Label>
            <Input
              value={content.title}
              onChange={(e) => onUpdate({ ...content, title: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">URL do Vídeo</Label>
            <Input
              value={content.url}
              onChange={(e) => onUpdate({ ...content, url: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="https://youtube.com/embed/..."
            />
          </div>
        </div>
      )

    default:
      return <div className="text-gray-400">Propriedades para {type} em desenvolvimento</div>
  }
}
