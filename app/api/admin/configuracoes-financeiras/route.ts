import { type NextRequest, NextResponse } from "next/server"
import { FinancialSettingsDB } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token || !token.includes("admin")) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
    }

    const settings = FinancialSettingsDB.get()

    return NextResponse.json({
      settings: {
        taxaSaquePix: settings.taxaSaquePix,
        taxaRetencaoVenda: settings.taxaRetencaoVenda,
        taxaFixaVenda: settings.taxaFixaVenda,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar configurações:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token || !token.includes("admin")) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
    }

    const { taxaSaquePix, taxaRetencaoVenda, taxaFixaVenda } = await request.json()

    const updatedSettings = FinancialSettingsDB.update({
      taxaSaquePix,
      taxaRetencaoVenda,
      taxaFixaVenda,
    })

    console.log("⚙️ Configurações financeiras atualizadas:", {
      taxaSaquePix,
      taxaRetencaoVenda,
      taxaFixaVenda,
    })

    return NextResponse.json({
      message: "Configurações atualizadas com sucesso",
      settings: updatedSettings,
    })
  } catch (error) {
    console.error("Erro ao atualizar configurações:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
