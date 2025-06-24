"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"
import { PenTool, CheckCircle, Clock, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { Info } from "lucide-react"

interface Document {
  id: string
  name: string
  path: string
  uploadDate: string
  status: "signed" | "unsigned"
}

export default function SignPage() {
  const [document, setDocument] = useState<Document | null>(null)
  const [signatureImage, setSignatureImage] = useState<File | null>(null)
  const [signatureText, setSignatureText] = useState<string>("")

  const [isSigning, setIsSigning] = useState(false)
  const [isSigned, setIsSigned] = useState(false)
  const [signatureTime, setSignatureTime] = useState<string>("")
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

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
          uploadDate: doc.createdAt,
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

  const handleSign = async () => {
    if (!user || !document) return

    setIsSigning(true)

    try {
      await apiClient.signDocument(params.id as string, signatureText, signatureImage ?? undefined)

      const now = new Date().toLocaleString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

      setSignatureTime(now)
      setIsSigned(true)

      toast({
        title: "Document signé !",
        description: "Votre signature a été appliquée avec succès",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la signature",
        variant: "destructive",
      })
    } finally {
      setIsSigning(false)
    }
  }

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

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Signature du document</h1>
          <p className="mt-2 text-gray-600">{document.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visualiseur PDF */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PenTool className="h-5 w-5" />
                  <span>Aperçu du document</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <embed
                  src={document.path}
                  type="application/pdf"
                  width="100%"
                  height="600px"
                  className="rounded"
                />
              </CardContent>
            </Card>
          </div>

          {/* Section de signature */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de signature</CardTitle>
                <CardDescription>Détails de la signature électronique</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texte de la signature</label>
                    <input
                      type="text"
                      value={signatureText}
                      onChange={(e) => setSignatureText(e.target.value)}
                      placeholder="Ex : Signé par Yamoussa le ..."
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200 text-sm"
                    />
                  </div>

                  {/* Champ image de signature */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image de la signature (optionnel)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSignatureImage(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                {signatureTime && (
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Signé le</p>
                      <p className="text-sm text-gray-500">{signatureTime}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {isSigned ? (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                    <h3 className="mt-4 text-lg font-semibold text-green-900">Document signé !</h3>
                    <p className="mt-2 text-sm text-green-700">
                      Votre signature électronique a été appliquée avec succès.
                    </p>

                    <Button onClick={handleBackToDashboard} className="mt-4 w-full">
                      Retour au tableau de bord
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Signer le document</CardTitle>
                  <CardDescription>
                    En signant ce document, vous acceptez que votre signature électronique ait la même valeur
                    juridique qu'une signature manuscrite.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="bg-blue-50 text-blue-800 border-blue-200 mb-4">
                    <div className="flex items-start space-x-2">
                      <Info className="h-5 w-5 mt-0.5 text-blue-600" />
                      <div>
                        <AlertTitle className="font-semibold">NB</AlertTitle>
                        <AlertDescription>
                          La signature sera apposée seulement sur la première signature.
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>

                  <div className="space-y-3">
                    <Button onClick={handleSign} disabled={isSigning} className="w-full" size="lg">
                      {isSigning ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Signature en cours...
                        </>
                      ) : (
                        <>
                          <PenTool className="mr-2 h-4 w-4" />
                          Signer le document
                        </>
                      )}
                    </Button>

                    <Button variant="outline" onClick={handleBackToDashboard} className="w-full">
                      Annuler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
