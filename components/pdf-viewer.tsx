"use client"

import { FileText } from "lucide-react"

interface PDFViewerProps {
  documentName: string
}

export function PDFViewer({ documentName }: PDFViewerProps) {
  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
      <div className="text-center">
        <FileText className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Aperçu PDF</h3>
        <p className="mt-2 text-sm text-gray-500">{documentName}</p>
        <p className="mt-1 text-xs text-gray-400">Le visualiseur PDF sera intégré ici avec react-pdf ou PDF.js</p>
      </div>
    </div>
  )
}
