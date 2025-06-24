"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { apiClient } from "@/lib/api"

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Vérifier le token au chargement
    const token = localStorage.getItem("auth-token")
    const userData = localStorage.getItem("user-data")

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Erreur parsing user data:", error)
        localStorage.removeItem("auth-token")
        localStorage.removeItem("user-data")
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Rediriger vers login si non connecté sur pages protégées
    const protectedRoutes = ["/dashboard", "/upload", "/sign"]
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    if (!isLoading && !user && isProtectedRoute) {
      router.push("/login")
    }
  }, [user, isLoading, pathname, router])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.login(email, password)

      localStorage.setItem("auth-token", response.token)
      localStorage.setItem("user-data", JSON.stringify(response.user))
      document.cookie = `auth-token=${response.token}; path=/; secure; SameSite=Strict`
      setUser(response.user)
      return true
    } catch (error) {
      console.error("Erreur de connexion:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error("Erreur de déconnexion:", error)
    } finally {
      localStorage.removeItem("auth-token")
      localStorage.removeItem("user-data")
      setUser(null)
      router.push("/login")
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
