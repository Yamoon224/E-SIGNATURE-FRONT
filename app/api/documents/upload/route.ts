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

export async function POST(request: NextRequest) {
  try {
    const decoded = verifyToken(request)

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    // Vérifier que c'est un PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Seuls les fichiers PDF sont acceptés" }, { status: 400 })
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Le fichier est trop volumineux (max 10MB)" }, { status: 400 })
    }

    // Simulation de sauvegarde
    // En production, sauvegarder le fichier sur le serveur ou cloud storage
    console.log(`Fichier uploadé: ${file.name} par utilisateur ${decoded.userId}`)

    return NextResponse.json({
      message: "Document uploadé avec succès",
      filename: file.name,
      size: file.size,
    })
  } catch (error) {
    console.error("Erreur upload:", error)
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 })
  }
}
