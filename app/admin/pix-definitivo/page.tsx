"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Copy, Check, Loader2 } from "lucide-react"
import Image from "next/image"

export default function PixDefinitivoPage() {
  const [formData, setFormData] = useState({
    name: "João Silva",
    cpf: "12345678901",
    amount: "67,90",
    description: "Teste PIX Definitivo - InfoPlatform",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("🚀 Gerando PIX definitivo...")

      const response = await fetch("/api/pix/solucao-definitiva", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        const text = await response.text()
        throw new Error(`Resposta inválida: ${text.substring(0, 100)}`)
      }

      if (!response.ok) {
        throw new Error(data.message || "Erro ao gerar PIX")
      }

      console.log("✅ PIX gerado com sucesso:", data)
      setResult(data)
    } catch (err: any) {
      console.error("❌ Erro:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (result?.data?.pixCopiaECola) {
      navigator.clipboard.writeText(result.data.pixCopiaECola)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🎯 PIX Definitivo</h1>
        <p className="text-gray-600 mt-2">
          Solução que sempre funciona - PIX real quando possível, mock profissional quando necessário
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Gerar PIX</CardTitle>
            <CardDescription>Preencha os dados para gerar um PIX que sempre funciona</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cpf: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando PIX...
                  </>
                ) : (
                  "🎯 Gerar PIX Definitivo"
                )}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Resultado */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✅ PIX Gerado com Sucesso
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{result.environment}</span>
              </CardTitle>
              <CardDescription>{result.message}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.note && (
                <Alert>
                  <AlertDescription>{result.note}</AlertDescription>
                </Alert>
              )}

              {/* QR Code */}
              <div className="text-center">
                <div className="border rounded-lg p-4 bg-white inline-block">
                  <Image
                    src={result.data.qrCode || "/placeholder.svg"}
                    alt="QR Code PIX"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                </div>
              </div>

              {/* Informações */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">TXID:</span>
                  <span className="font-mono">{result.data.txid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Valor:</span>
                  <span className="text-green-600 font-bold">R$ {result.data.valor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">{result.data.status}</span>
                </div>
              </div>

              {/* Código Copia e Cola */}
              <div>
                <Label>Código PIX (Copia e Cola)</Label>
                <div className="flex mt-1">
                  <Input value={result.data.pixCopiaECola} readOnly className="font-mono text-xs" />
                  <Button type="button" variant="outline" size="icon" className="ml-2" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {result.efibankWorking && (
                <Alert>
                  <AlertTitle>🎉 EfiBank Funcionando!</AlertTitle>
                  <AlertDescription>
                    A conexão com EfiBank foi bem-sucedida. A implementação completa será finalizada em breve.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
