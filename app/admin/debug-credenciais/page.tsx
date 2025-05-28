"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugCredenciais() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testCredentials = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/credenciais")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Debug das Credenciais EfiBank</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testCredentials} disabled={loading}>
            {loading ? "🔄 Verificando..." : "🔍 Verificar Credenciais"}
          </Button>

          {result && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Resultado:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
