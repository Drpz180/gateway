import { NextResponse } from "next/server"
import { DatabaseDebug } from "@/lib/database"

export async function POST() {
  try {
    console.log("🔄 Debug: Forçando sincronização...")

    const result = DatabaseDebug.forceSync()

    console.log("📊 Resultado da sincronização:", result)

    return NextResponse.json({
      success: true,
      message: "Sincronização executada",
      status: result,
    })
  } catch (error) {
    console.error("❌ Erro na sincronização:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
