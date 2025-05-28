import { type NextRequest, NextResponse } from "next/server"
import { UserDB } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token || !token.includes("admin")) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
    }

    console.log("✅ Desbloqueando usuário:", params.id)

    const user = UserDB.unblock(params.id)

    if (!user) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }

    console.log("✅ Usuário desbloqueado:", user.name)

    return NextResponse.json({
      message: "Usuário desbloqueado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    })
  } catch (error) {
    console.error("Erro ao desbloquear usuário:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
