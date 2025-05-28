import { efiBankService } from "@/lib/efibank"

export async function POST() {
  try {
    console.log("🧪 Testando integração EfiBank...")

    // Dados de teste
    const testData = {
      valor: 10.0, // R$ 10,00 para teste
      cpf: "12345678901",
      nome: "Teste Usuario",
      descricao: "Teste de integração EfiBank",
      txid: `TEST_${Date.now()}`,
    }

    console.log("📋 Dados do teste:", testData)

    // Criar cobrança PIX de teste
    const result = await efiBankService.createPixCharge(testData)

    console.log("✅ Teste EfiBank concluído:", {
      txid: result.txid,
      hasQrCode: !!result.qrCode,
      hasCopyPaste: !!result.copyPasteCode,
    })

    return Response.json({
      success: true,
      message: "✅ Teste EfiBank realizado com sucesso!",
      data: {
        txid: result.txid,
        qrCodeGenerated: !!result.qrCode,
        copyPasteGenerated: !!result.copyPasteCode,
        linkPagamento: result.linkPagamento,
        expiresAt: result.expiresAt,
        isMock: result.idCobranca.startsWith("mock_"),
      },
      testData,
    })
  } catch (error) {
    console.error("❌ Erro no teste EfiBank:", error)

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        message: "❌ Falha no teste EfiBank",
      },
      { status: 500 },
    )
  }
}
