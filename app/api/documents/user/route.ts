import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Base de données simulée des documents
const documents = [
  {
    id: 1,
    userId: 1,
    filename: "Contrat_de_travail.pdf",
    uploadDate: "2024-01-15T10:30:00Z",
    status: "UNSIGNED",
  },
  {
    id: 2,
    userId: 1,
    filename: "Accord_confidentialite.pdf",
    uploadDate: "2024-01-14T14:20:00Z",
    status: "SIGNED",
  },
  {
    id: 3,
    userId: 1,
    filename: "Facture_janvier.pdf",
    uploadDate: "2024-01-13T09:15:00Z",
    status: "UNSIGNED",
  },
]

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

export async function GET(request: NextRequest) {
  try {
    const decoded = verifyToken(request)

    // Filtrer les documents de l'utilisateur
    const userDocuments = documents.filter((doc) => doc.userId === decoded.userId)

    return NextResponse.json(userDocuments)
  } catch (error) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
}
