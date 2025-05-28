"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function TesteImplementacaoFuncionando() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    amount: "67.90",
    payerName: "Felipe Cruz",
    payerDocument: "860.525.775-09",
    description: "Teste PIX - Implementação que funciona",
  })

  const handleTest = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/pix/test-working", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Erro na requisição",
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🧪 Teste Implementação que Funciona</h1>
          <p className="text-muted-foreground">Testando PIX com a mesma implementação do seu sistema que funciona</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Dados do Teste</CardTitle>
            <CardDescription>Preencha os dados para gerar o PIX</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="payerName">Nome do Pagador</Label>
              <Input
                id="payerName"
                value={formData.payerName}
                onChange={(e) => setFormData((prev) => ({ ...prev, payerName: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="payerDocument">CPF do Pagador</Label>
              <Input
                id="payerDocument"
                value={formData.payerDocument}
                onChange={(e) => setFormData((prev) => ({ ...prev, payerDocument: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <Button onClick={handleTest} disabled={loading} className="w-full">
              {loading ? "⏳ Testando..." : "🚀 Testar PIX"}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Resultado do Teste</CardTitle>
            <CardDescription>Resultado da criação do PIX</CardDescription>
          </CardHeader>
          <CardContent>
            {!result && (
              <div className="text-center text-muted-foreground py-8">
                👆 Clique em "Testar PIX" para ver o resultado
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {result.success ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <span>✅</span>
                      <span className="font-semibold">PIX criado com sucesso!</span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <Label>TXID:</Label>
                        <div className="font-mono text-sm bg-gray-100 p-2 rounded">{result.txid}</div>
                      </div>

                      <div>
                        <Label>Valor:</Label>
                        <div className="font-semibold text-lg">R$ {result.amount}</div>
                      </div>

                      <div>
                        <Label>Status:</Label>
                        <div className="font-semibold">{result.status}</div>
                      </div>

                      {result.qrCode && (
                        <div>
                          <Label>QR Code:</Label>
                          <div className="mt-2">
                            <img
                              src={`data:image/png;base64,${result.qrCode}`}
                              alt="QR Code PIX"
                              className="border rounded"
                            />
                          </div>
                        </div>
                      )}

                      {result.copyPasteCode && (
                        <div>
                          <Label>Código Copia e Cola:</Label>
                          <Textarea value={result.copyPasteCode} readOnly className="font-mono text-xs" rows={3} />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-red-600">
                      <span>❌</span>
                      <span className="font-semibold">Erro no teste</span>
                    </div>

                    <div>
                      <Label>Mensagem:</Label>
                      <div className="text-red-600 font-mono text-sm bg-red-50 p-2 rounded">{result.message}</div>
                    </div>

                    {result.error && (
                      <div>
                        <Label>Detalhes do erro:</Label>
                        <Textarea value={result.error} readOnly className="font-mono text-xs text-red-600" rows={5} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
