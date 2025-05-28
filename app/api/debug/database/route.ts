import { NextResponse } from "next/server"
import { DatabaseDebug } from "@/lib/database"

export async function GET() {
  try {
    console.log("🔍 Debug: Verificando status do banco...")

    const status = DatabaseDebug.getStatus()

    console.log("📊 Status do banco:", status)

    return NextResponse.json(status)
  } catch (error) {
    console.error("❌ Erro no debug do banco:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
