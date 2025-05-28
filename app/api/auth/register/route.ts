import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, password, role } = body

    if (!email || !name || !password) {
      return new NextResponse("Missing Fields", { status: 400 })
    }

    const exist = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })

    if (exist) {
      return new NextResponse("Email already exists", { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        role,
      },
    })

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    return NextResponse.json({ user: newUser, token })
  } catch (error: any) {
    console.log(error, "REGISTRATION ERROR")
    return new NextResponse("Internal Error", { status: 500 })
  }
}
