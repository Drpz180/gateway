import { type NextRequest, NextResponse } from "next/server"
import { UserDB } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token || !token.includes("admin")) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
    }

    const { reason } = await request.json()

    if (!reason) {
      return NextResponse.json({ message: "Motivo da rejeição é obrigatório" }, { status: 400 })
    }

    console.log("❌ Rejeitando documentos do usuário:", params.id, "Motivo:", reason)

    const user = UserDB.rejectDocuments(params.id, reason)

    if (!user) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }

    console.log("📧 Documentos rejeitados para:", user.name)

    // TODO: Enviar email de rejeição
    // await sendRejectionEmail(user.email, user.name, reason)

    return NextResponse.json({
      message: "Documentos rejeitados",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        rejectionReason: reason,
      },
    })
  } catch (error) {
    console.error("Erro ao rejeitar documentos:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
