import { NextResponse } from "next/server"
import { UserDB } from "@/lib/database"

export async function GET() {
  try {
    const users = UserDB.findAll()

    console.log("📋 Usuários cadastrados:")
    users.forEach((user) => {
      console.log(`- ${user.email} (${user.role}) - Status: ${user.status}`)
    })

    return NextResponse.json({
      message: "Usuários listados no console",
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        status: u.status,
      })),
    })
  } catch (error) {
    console.error("❌ Erro ao listar usuários:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Criar usuários admin se não existirem
    const adminEmails = ["admin@infoplatform.com", "admin@admin.com"]

    for (const email of adminEmails) {
      const existingUser = UserDB.findByEmail(email)
      if (!existingUser) {
        UserDB.create({
          email,
          name: email === "admin@admin.com" ? "Admin Master" : "Administrador",
          role: "admin",
          status: "approved",
          saldoDisponivel: 0,
          saldoTotalRecebido: 0,
          totalSales: 0,
        })
        console.log(`✅ Usuário admin criado: ${email}`)
      }
    }

    // Criar usuário teste se não existir
    const testUser = UserDB.findByEmail("joao@email.com")
    if (!testUser) {
      UserDB.create({
        email: "joao@email.com",
        name: "João Silva",
        cpf: "12345678901",
        role: "user",
        status: "approved",
        documents: {
          status: "approved",
        },
        saldoDisponivel: 0,
        saldoTotalRecebido: 0,
        totalSales: 0,
      })
      console.log("✅ Usuário teste criado: joao@email.com")
    }

    return NextResponse.json({
      message: "Usuários admin criados/verificados com sucesso",
      adminEmails,
    })
  } catch (error) {
    console.error("❌ Erro ao criar usuários:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
