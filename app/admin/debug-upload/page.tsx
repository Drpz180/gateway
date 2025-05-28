"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import AdminLayout from "@/components/layouts/AdminLayout"

export default function DebugUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      console.log("🔄 Iniciando upload de teste...")
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      console.log("📋 Resultado do upload:", result)
      setUploadResult(result)
    } catch (error) {
      console.error("❌ Erro no upload:", error)
      setUploadResult({ error: "Erro de conexão" })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Debug - Sistema de Upload</h1>
          <p className="text-gray-600">Teste o sistema de upload de imagens</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Test */}
          <Card>
            <CardHeader>
              <CardTitle>Teste de Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Selecionar Arquivo</Label>
                <Input type="file" accept="image/*" onChange={handleFileSelect} />
              </div>

              {selectedFile && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Arquivo Selecionado:</h3>
                  <p>
                    <strong>Nome:</strong> {selectedFile.name}
                  </p>
                  <p>
                    <strong>Tamanho:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p>
                    <strong>Tipo:</strong> {selectedFile.type}
                  </p>
                </div>
              )}

              <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Enviando..." : "Fazer Upload"}
              </Button>
            </CardContent>
          </Card>

          {/* Upload Result */}
          <Card>
            <CardHeader>
              <CardTitle>Resultado do Upload</CardTitle>
            </CardHeader>
            <CardContent>
              {uploadResult ? (
                <div className="space-y-4">
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                    {JSON.stringify(uploadResult, null, 2)}
                  </pre>

                  {uploadResult.success && uploadResult.url && (
                    <div>
                      <h3 className="font-semibold mb-2">Imagem Carregada:</h3>
                      <img
                        src={uploadResult.url || "/placeholder.svg"}
                        alt="Upload result"
                        className="max-w-full h-auto rounded-lg border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=200&width=300&text=Erro+ao+Carregar"
                        }}
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        URL: <code>{uploadResult.url}</code>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Nenhum upload realizado ainda</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Diretório de Upload:</h3>
                <code className="bg-gray-100 p-2 rounded text-sm">public/uploads/products/</code>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Formatos Aceitos:</h3>
                <p className="text-sm">JPG, PNG, JPEG</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Tamanho Máximo:</h3>
                <p className="text-sm">10 MB</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">API Endpoint:</h3>
                <code className="bg-gray-100 p-2 rounded text-sm">/api/upload</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
