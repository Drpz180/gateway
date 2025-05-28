import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, error: "Nenhum arquivo enviado" })
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Apenas imagens são permitidas" })
    }

    // Validar tamanho (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Arquivo muito grande (máx 10MB)" })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const filename = `product-${timestamp}.${extension}`

    // Salvar na pasta public/uploads
    const path = join(process.cwd(), "public", "uploads", filename)
    await writeFile(path, buffer)

    const imageUrl = `/uploads/${filename}`

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      message: "Imagem enviada com sucesso",
    })
  } catch (error) {
    console.error("Erro no upload:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
