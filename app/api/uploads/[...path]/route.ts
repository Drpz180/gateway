import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const filePath = params.path.join("/")
    const fullPath = join(process.cwd(), "public", "uploads", filePath)

    console.log("🖼️ Tentando servir imagem:", fullPath)

    const file = await readFile(fullPath)

    // Determinar o tipo de conteúdo baseado na extensão
    const extension = filePath.split(".").pop()?.toLowerCase()
    let contentType = "image/jpeg"

    switch (extension) {
      case "png":
        contentType = "image/png"
        break
      case "gif":
        contentType = "image/gif"
        break
      case "webp":
        contentType = "image/webp"
        break
      case "svg":
        contentType = "image/svg+xml"
        break
    }

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    })
  } catch (error) {
    console.error("❌ Erro ao servir imagem:", error)
    return new NextResponse("Imagem não encontrada", { status: 404 })
  }
}
