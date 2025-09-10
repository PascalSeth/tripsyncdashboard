import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "../[...nextauth]/route"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
console.log("Protected route accessed by user:", session.user)
  return NextResponse.json({
    message: "This is protected content",
    user: session.user,
    token: session.token
  })
}