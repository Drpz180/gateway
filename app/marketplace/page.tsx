import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Star, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

// Mock products data
const products = [
  {
    id: "1",
    name: "Curso Completo de Marketing Digital",
    description: "Aprenda marketing digital do zero ao avançado com estratégias comprovadas",
    price: 197,
    category: "Marketing",
    rating: 4.8,
    students: 1250,
    image: "/placeholder.svg?height=200&width=300",
    creator: "João Silva",
    slug: "curso-completo-marketing-digital",
  },
  {
    id: "2",
    name: "E-book: Vendas de Alto Impacto",
    description: "Técnicas avançadas de vendas para aumentar sua conversão",
    price: 47,
    category: "Vendas",
    rating: 4.9,
    students: 890,
    image: "/placeholder.svg?height=200&width=300",
    creator: "Maria Santos",
    slug: "ebook-vendas-alto-impacto",
  },
  {
    id: "3",
    name: "Curso de Programação Python",
    description: "Do básico ao avançado em Python para iniciantes",
    price: 297,
    category: "Programação",
    rating: 4.7,
    students: 2100,
    image: "/placeholder.svg?height=200&width=300",
    creator: "Pedro Oliveira",
    slug: "curso-programacao-python",
  },
  {
    id: "4",
    name: "Mentoria em Empreendedorismo",
    description: "Acompanhamento personalizado para empreendedores",
    price: 497,
    category: "Empreendedorismo",
    rating: 5.0,
    students: 156,
    image: "/placeholder.svg?height=200&width=300",
    creator: "Ana Costa",
    slug: "mentoria-empreendedorismo",
  },
  {
    id: "5",
    name: "Design Gráfico Profissional",
    description: "Crie designs incríveis com Photoshop e Illustrator",
    price: 147,
    category: "Design",
    rating: 4.6,
    students: 780,
    image: "/placeholder.svg?height=200&width=300",
    creator: "Carlos Lima",
    slug: "design-grafico-profissional",
  },
  {
    id: "6",
    name: "Investimentos para Iniciantes",
    description: "Aprenda a investir seu dinheiro de forma inteligente",
    price: 97,
    category: "Finanças",
    rating: 4.8,
    students: 1450,
    image: "/placeholder.svg?height=200&width=300",
    creator: "Roberto Silva",
    slug: "investimentos-iniciantes",
  },
]

const categories = ["Todos", "Marketing", "Vendas", "Programação", "Empreendedorismo", "Design", "Finanças"]

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">InfoPlatform</span>
            </Link>
            <div className="flex space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Entrar</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Vender Produtos</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Descubra os Melhores Infoprodutos</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Cursos, e-books, mentorias e muito mais para acelerar seu aprendizado
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input placeholder="Buscar produtos..." className="pl-10 pr-4 py-3 text-lg bg-white text-gray-900" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button key={category} variant={category === "Todos" ? "default" : "outline"} className="rounded-full">
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Produtos em Destaque</h2>
            <p className="text-gray-600">{products.length} produtos encontrados</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 left-2">{product.category}</Badge>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{product.students.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-600">R$ {product.price}</p>
                      <p className="text-sm text-gray-600">por {product.creator}</p>
                    </div>
                    <Link href={`/produto/${product.slug}`}>
                      <Button>Ver Produto</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <TrendingUp className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-xl font-bold">InfoPlatform</span>
              </div>
              <p className="text-gray-400">A plataforma completa para infoprodutos digitais.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produtos</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Cursos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    E-books
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Mentorias
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Software
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contato
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Termos de Uso
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Carreiras
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Imprensa
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 InfoPlatform. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
