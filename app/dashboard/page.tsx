"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { DocumentCard } from "@/components/document-card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Plus } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider" 
import { jwtDecode } from "jwt-decode"

interface Document {
  id: string
  name: string
  path: string
  uploadDate: string
  status: "signed" | "unsigned"
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const router = useRouter()
  const { toast } = useToast()
  const { isLoading } = useAuth() // 👈 récupère user et état

  useEffect(() => {
    const token = localStorage.getItem("auth-token")
    const isTokenValid = () => {
      if (!token) return false
  
      try {
        const decoded: { exp: number } = jwtDecode(token)
        const now = Math.floor(Date.now() / 1000)
        return decoded.exp > now
      } catch (error) {
        return false
      }
    }
  
    if (!isLoading) {
      if (!isTokenValid()) {
        localStorage.removeItem("auth-token")
        localStorage.removeItem("user-data")
        router.push("/login")
      } else {
        // 👇 Token OK → on charge les documents
        const loadDocuments = async () => {
          try {
            const docs = await apiClient.getDocuments()

            setDocuments(
              docs.map((doc: any) => ({
                id: doc.id.toString(),
                name: doc.filename,
                path: "http://localhost/" + doc.path.replace(/\\/g, "/"),
                uploadDate: doc.createdAt,
                status: doc.signed ? "signed" : "unsigned",
              })),              
            )
          } catch (error) {
            console.error("Erreur chargement documents:", error)
            toast({
              title: "Erreur",
              description: "Impossible de charger les documents",
              variant: "destructive",
            })
          }
        }
  
        loadDocuments()
      }
    }
  }, [toast, isLoading, router])


  const handleUpload = () => {
    router.push("/upload")
  }

  const handleViewOrSign = (document: Document) => {
    if (document.status === "unsigned") {
      router.push(`/sign/${document.id}`)
    } else {
      router.push(`/document/${document.id}`)
    }
  }

  const handleDestroy = async (document: Document) => {
    try {
      await apiClient.deleteDocument(document.id)
  
      toast({
        title: "Document supprimé",
        description: `"${document.name}" a été supprimé avec succès.`,
        variant: "default",
      })
  
      // Recharge les documents
      const docs = await apiClient.getDocuments()
      setDocuments(
        docs.map((doc: any) => ({
          id: doc.id.toString(),
          name: doc.filename,
          path: "http://localhost:8080/" + doc.path.replace(/\\/g, "/"),
          uploadDate: doc.createdAt,
          status: doc.signed ? "signed" : "unsigned",
        }))
      )
    } catch (err) {
      console.error("Erreur lors de la suppression du document :", err)
      toast({
        title: "Erreur",
        description: "Échec de la suppression du document",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
              <p className="mt-2 text-gray-600">Gérez vos documents et signatures électroniques</p>
            </div>

            <Button onClick={handleUpload} className="flex items-center space-x-2 w-full sm:w-auto">
              <Upload className="h-5 w-5" />
              <span>Uploader un document</span>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Mes documents ({documents.length})</h2>
            </div>
          </div>

          {documents.length === 0 ? (
            <div className="px-4 sm:px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun document</h3>
              <p className="mt-2 text-gray-500">Commencez par uploader votre premier document PDF</p>
              <Button onClick={handleUpload} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Uploader un document
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onAction={() => handleViewOrSign(document)}
                  onDelete={() => handleDestroy(document)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
