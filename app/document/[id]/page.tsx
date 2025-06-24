"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PenTool } from "lucide-react"
import { apiClient } from "@/lib/api"

interface Document {
  id: string
  name: string
  path: string
  uploadDate: string
  status: "signed" | "unsigned"
}

export default function DocumentPage() {
  const [document, setDocument] = useState<Document | null>(null)

  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const getDocument = async (id : string) => {
      const token = localStorage.getItem("auth-token")
      if (!token) return

      try {
        
        const doc = await apiClient.getDocument(id)
        setDocument({
          id: doc.id.toString(),
          name: doc.filename,
          path: "https://e-signature-lii6.onrender.com/" + doc.path.replace(/\\/g, "/"), // sécurité si le path contient des backslashes
          uploadDate: doc.created_at,
          status: doc.signed ? "signed" : "unsigned",
        })
      } catch (err) {
        console.error("Erreur lors du chargement du document :", err)
      }
    }

    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!id) return;
    getDocument(id);

    console.log(document)
  }, [params.id])

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement du document...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Document</h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                  <PenTool className="h-5 w-5 text-blue-600" />
                  <span className="text-base sm:text-lg">Aperçu du document : {document.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-hidden rounded shadow">
                  <iframe
                    src={document.path}
                    className="w-full h-[400px] sm:h-[500px] md:h-[600px] rounded border"
                    sandbox=""
                    allow="autoplay"
                    title="Aperçu PDF"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
