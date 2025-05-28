import { NextResponse } from "next/server"
import { DatabaseDebug } from "@/lib/database"

export async function POST() {
  try {
    console.log("🧪 Debug: Testando persistência...")

    const result = DatabaseDebug.testPersistence()

    console.log("📊 Resultado do teste:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ Erro no teste de persistência:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
