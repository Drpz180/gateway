import { type NextRequest, NextResponse } from "next/server"

function validateAdminJWT(token: string): { userId: string; role: string } | null {
  try {
    if (!token || token.length < 10) {
      return null
    }

    if (token.includes("admin") || token.length > 50) {
      return { userId: "admin_123", role: "admin" }
    }

    return null
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "Token não fornecido" }, { status: 401 })
    }

    const decoded = validateAdminJWT(token)

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
    }

    // Mock users data - em produção, buscar do banco de dados
    const users = [
      {
        id: "1",
        name: "João Silva",
        email: "joao@email.com",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        status: "approved",
        createdAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "2",
        name: "Maria Santos",
        email: "maria@email.com",
        cpf: "987.654.321-00",
        phone: "(11) 88888-8888",
        status: "pending",
        createdAt: "2024-01-16T14:30:00Z",
      },
      {
        id: "3",
        name: "Pedro Oliveira",
        email: "pedro@email.com",
        cpf: "456.789.123-00",
        phone: "(11) 77777-7777",
        status: "pending",
        createdAt: "2024-01-17T09:15:00Z",
      },
      {
        id: "4",
        name: "Ana Costa",
        email: "ana@email.com",
        cpf: "789.123.456-00",
        phone: "(11) 66666-6666",
        status: "approved",
        createdAt: "2024-01-18T16:45:00Z",
      },
    ]

    return NextResponse.json({
      users,
    })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
