import { type NextRequest, NextResponse } from "next/server"
import { UserDB } from "@/lib/database"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token || !token.includes("admin")) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
    }

    console.log("🗑️ Excluindo usuário:", params.id)

    const success = UserDB.delete(params.id)

    if (!success) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }

    console.log("✅ Usuário excluído com sucesso")

    return NextResponse.json({
      message: "Usuário excluído com sucesso",
    })
  } catch (error) {
    console.error("Erro ao excluir usuário:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
