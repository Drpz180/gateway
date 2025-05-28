"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      // Verificar se a resposta é JSON válida
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Resposta inválida do servidor")
      }

      const data = await response.json()

      if (response.ok) {
        // Salvar dados do usuário
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${data.user.name}`,
        })

        // Redirecionar baseado no role
        if (data.user.role === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/dashboard")
        }
      } else {
        setError(data.message || "Erro no login")
      }
    } catch (error) {
      console.error("Erro no login:", error)
      setError("Erro de conexão. Verifique sua internet e tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="InfoPlatform"
            className="mx-auto h-12 w-auto"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=48&width=150&text=InfoPlatform"
            }}
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Faça login em sua conta</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{" "}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              crie uma nova conta
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Digite suas credenciais para acessar sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  "Entrando..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            {/* Credenciais de teste */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Contas Disponíveis:</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div>
                  <strong>👤 Vendedor:</strong> joao@email.com | Qualquer senha
                </div>
                <div>
                  <strong>🔧 Admin:</strong> admin@infoplatform.com | Qualquer senha
                </div>
                <div>
                  <strong>👑 Admin Master:</strong> admin@admin.com | Qualquer senha
                </div>
                <div className="mt-2 text-xs text-blue-600">💡 Em desenvolvimento, qualquer senha funciona</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
