import { type NextRequest, NextResponse } from "next/server"
import { UserDB } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("🔐 Tentativa de login:", email)

    // Validar dados
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email e senha são obrigatórios" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Buscar usuário no banco de dados
    const user = UserDB.findByEmail(email.toLowerCase())

    console.log("👤 Usuário encontrado:", user ? "Sim" : "Não")

    if (!user) {
      console.log("❌ Usuário não encontrado:", email)
      return NextResponse.json(
        { message: "Credenciais inválidas" },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Em desenvolvimento, aceitar qualquer senha para facilitar testes
    // Em produção, você deve verificar a senha hasheada
    console.log("✅ Login realizado com sucesso para:", email, "- Role:", user.role)

    // Criar token simples para desenvolvimento
    const token = `token_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2)}`

    return NextResponse.json(
      {
        message: "Login realizado com sucesso",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("❌ Erro no login:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
