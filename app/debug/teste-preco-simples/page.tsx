"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestePrecoSimplesPage() {
  const [price, setPrice] = useState("")
  const [result, setResult] = useState<any>(null)

  const handleTest = async () => {
    console.log("🧪 TESTE SIMPLES DE PREÇO")
    console.log("  Valor digitado:", price)

    const formData = new FormData()
    formData.append("name", "Produto Teste")
    formData.append("description", "Descrição teste")
    formData.append("price", price) // Enviar exatamente como digitado

    console.log("📤 Enviando para API...")

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      console.log("📋 RESULTADO:", result)
      setResult(result)
    } catch (error) {
      console.error("❌ ERRO:", error)
      setResult({ error: error.message })
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>🧪 Teste Simples de Preço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label>Digite o preço:</label>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="97.50"
            />
          </div>

          <div className="text-sm text-gray-600">
            <p>Valor atual: "{price}"</p>
            <p>Parseado: {Number.parseFloat(price) || 0}</p>
            <p>Válido: {Number.parseFloat(price) > 0 ? "✅ Sim" : "❌ Não"}</p>
          </div>

          <Button onClick={handleTest} className="w-full">
            🧪 Testar API
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h4 className="font-bold">Resultado:</h4>
              <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
