"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, X, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      const pdfFile = files.find((file) => file.type === "application/pdf")

      if (pdfFile) {
        setSelectedFile(pdfFile)
      } else {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un fichier PDF",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
    } else {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier PDF",
        variant: "destructive",
      })
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    try {
      await apiClient.uploadDocument(selectedFile)
      toast({
        title: "Succès",
        description: "Document uploadé avec succès !",
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'upload",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload de document</h1>
          <p className="mt-2 text-gray-600">Sélectionnez un fichier PDF à signer</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sélectionner un document PDF</CardTitle>
            <CardDescription>Glissez-déposez votre fichier PDF ou cliquez pour le sélectionner</CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-lg font-medium text-blue-600 hover:text-blue-500">
                      Cliquez pour sélectionner
                    </span>
                    <span className="text-gray-500"> ou glissez-déposez</span>
                  </label>
                  <input id="file-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
                </div>
                <p className="mt-2 text-sm text-gray-500">Fichiers PDF uniquement (max. 10MB)</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Fichier sélectionné avec succès</AlertDescription>
                </Alert>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" onClick={removeFile} className="text-gray-500 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex space-x-4">
                  <Button onClick={handleUpload} disabled={isUploading} className="flex-1">
                    {isUploading ? "Upload en cours..." : "Envoyer le document"}
                  </Button>

                  <Button variant="outline" onClick={() => router.push("/dashboard")}>
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
