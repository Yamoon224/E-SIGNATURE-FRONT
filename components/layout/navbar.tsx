"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { PenTool, LogOut, User } from "lucide-react"
import Link from 'next/link'

export function Navbar() {
  const { user, logout } = useAuth()
  const [showEmail, setShowEmail] = useState(false)

  if (!user) return null

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 gap-4">
          {/* Logo / lien tableau de bord */}
          <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition">
            <PenTool className="h-6 w-6 text-blue-600" />
            <span>Tableau de bord</span>
          </Link>

          {/* Zone utilisateur + bouton logout */}
          <div className="flex items-center space-x-4">
            {/* Icône user avec email au clic */}
            <div className="relative flex items-center">
              <User
                className="h-5 w-5 cursor-pointer text-gray-700"
                onClick={() => setShowEmail(!showEmail)}
              />
              
              {/* Email en inline sur desktop, en popup sur mobile */}
              <span
                className={`
                  text-xs text-gray-700 ml-2 
                  hidden sm:inline 
                  ${showEmail ? "inline absolute top-full right-0 mt-1 w-max bg-gray-100 px-2 py-1 rounded shadow-lg sm:relative sm:top-0 sm:mt-0 sm:bg-transparent sm:shadow-none" : "sm:inline"}
                `}
              >
                {user.email}
              </span>
            </div>


            {/* Bouton déconnexion */}
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
