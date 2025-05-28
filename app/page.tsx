import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Users, TrendingUp, Award, Zap, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">InfoPlatform</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Entrar</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Cadastrar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            A Plataforma Completa para
            <span className="text-blue-600"> Infoprodutos</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Crie, venda e gerencie seus produtos digitais com a plataforma mais completa do mercado. Sistema de
            afiliados, checkout builder e muito mais.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/register">
              <Button size="lg" className="px-8 py-3">
                Começar Agora
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Ver Produtos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tudo que você precisa em uma plataforma
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <ShoppingCart className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Checkout Builder</CardTitle>
                <CardDescription>Crie páginas de venda profissionais com nosso editor drag-and-drop</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>Sistema de Afiliados</CardTitle>
                <CardDescription>Expanda suas vendas com uma rede de afiliados automática</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>Analytics Avançado</CardTitle>
                <CardDescription>Acompanhe suas vendas e performance em tempo real</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-10 w-10 text-yellow-600 mb-2" />
                <CardTitle>Sistema de Recompensas</CardTitle>
                <CardDescription>Conquiste placas e reconhecimento por suas vendas</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-red-600 mb-2" />
                <CardTitle>Pagamentos Seguros</CardTitle>
                <CardDescription>Integração com EfiBank e split automático de comissões</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-indigo-600 mb-2" />
                <CardTitle>Deploy Automático</CardTitle>
                <CardDescription>Publique seus produtos instantaneamente na web</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-blue-400" />
            <span className="ml-2 text-xl font-bold">InfoPlatform</span>
          </div>
          <p className="text-gray-400">© 2024 InfoPlatform. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
