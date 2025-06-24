"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Eye, PenTool, Trash } from "lucide-react"

interface Document {
  id: string
  name: string
  path: string
  uploadDate: string
  status: "signed" | "unsigned"
}

interface DocumentCardProps {
  document: Document
  onAction: (document: Document) => void
  onDelete: (document: Document) => void
}

export function DocumentCard({ document, onAction, onDelete }: DocumentCardProps) {
  const formatDate = (dateString: string) => {
    // Convertit '2025-06-19 15:50:35.570312' en '2025-06-19T15:50:35.570312'
    const safeDate = dateString.replace(" ", "T")
    return new Date(safeDate).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    if (status === "signed") {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          Signé
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
        Non signé
      </Badge>
    )
  }

  const getActionButton = (document : Document) => {
    if (document.status === "signed") {
      return (
        <Button variant="outline" size="sm" onClick={() => onAction(document)}>
          <Eye className="mr-2 h-4 w-4" />
          Voir
        </Button>
      )
    }
    return (
      <Button size="sm" onClick={() => onAction(document)}>
        <PenTool className="mr-2 h-4 w-4" />
        Signer
      </Button>
    )
  }

  return (
    <div className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex flex-row items-center justify-between space-x-4">
        {/* Partie gauche : info du document */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <FileText className="h-8 w-8 text-red-500" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-row items-center space-x-3">
              <h3 className="text-sm font-medium text-gray-900 truncate">{document.name}</h3>
              {getStatusBadge(document.status)}
            </div>

            <div className="flex items-center mt-1 text-sm text-gray-500">
              <Calendar className="mr-1 h-4 w-4" />
              <span>{formatDate(document.uploadDate)}</span>
            </div>
          </div>
        </div>

        {/* Partie droite : actions */}
        <div className="flex flex-row items-center gap-2 sm:ml-4">
          <Button size="sm" onClick={() => onAction(document)} className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Voir</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (window.confirm("Voulez-vous vraiment supprimer ce document ?")) {
                onDelete(document)
              }
            }}
            className="flex items-center space-x-2"
          >
            <Trash className="h-4 w-4" />
            <span className="hidden sm:inline">Supprimer</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
