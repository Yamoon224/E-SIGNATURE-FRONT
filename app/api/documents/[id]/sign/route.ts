import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")

  if (!token) {
    throw new Error("Token manquant")
  }

  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (error) {
    throw new Error("Token invalide")
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decoded = verifyToken(request)
    const documentId = Number.parseInt(params.id)

    const formData = await request.formData()
    const signatureText = formData.get("signatureText") as string
    const signatureImage = formData.get("signatureImage") as File | null

    if (!signatureText) {
      return NextResponse.json({ error: "Signature requise" }, { status: 400 })
    }

    // Simulation de signature du document
    console.log(`Document ${documentId} signé par ${decoded.name}`)
    console.log(`Signature: ${signatureText}`)

    if (signatureImage) {
      console.log(`Image de signature: ${signatureImage.name}`)
    }

    return NextResponse.json({
      message: "Document signé avec succès",
      signedAt: new Date().toISOString(),
      signedBy: decoded.name,
    })
  } catch (error) {
    console.error("Erreur signature:", error)
    return NextResponse.json({ error: "Erreur lors de la signature" }, { status: 500 })
  }
}
