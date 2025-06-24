// lib/api.ts
import axios from "axios"
import NProgress from "./nprogress"

// Démarrer NProgress avant la requête
axios.interceptors.request.use((config) => {
  NProgress.start()
  return config
})

// Arrêter NProgress après la réponse
axios.interceptors.response.use(
  (response) => {
    NProgress.done()
    return response
  },
  (error) => {
    NProgress.done()
    if (error.response?.status === 401) {
      localStorage.removeItem("auth-token")
      localStorage.removeItem("user-data")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

class ApiClient {
  private baseUrl: string

  constructor() {
    // this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
    this.baseUrl = "http://localhost:8080"
  }

  private getAuthHeaders() {
    const token = localStorage.getItem("auth-token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private getAuthHeadersMultipart() {
    const token = localStorage.getItem("auth-token")
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async login(email: string, password: string) {
    try {
      const res = await axios.post(`${this.baseUrl}/api/auth/login`, {
        email,
        password,
      }, {
        headers: { "Content-Type": "application/json" },
      })

      return res.data
    } catch (error: any) {
      const msg = error.response?.data?.error || "Erreur de connexion"
      throw new Error(msg)
    }
  }

  // async logout() {
  //   try {
  //     const res = await axios.post(`${this.baseUrl}/api/auth/logout`, null, {
  //       headers: this.getAuthHeaders(),
  //     })
  //     return res.data
  //   } catch (error: any) {
  //     throw new Error(error.response?.data?.error || "Erreur de déconnexion")
  //   }
  // }

  async logout() {
    // Supprimer les infos du user côté client uniquement
    localStorage.removeItem("auth-token")
    localStorage.removeItem("user-data")
  }

  async getDocument(id : string) {
    const token = localStorage.getItem("auth-token")
    if (!token) return

    try {
      const res = await axios.get(`${this.baseUrl}/api/documents/${id}`, {
        headers: this.getAuthHeaders(),
      })
      
      return res.data
    } catch (error: any) {
      throw new Error("Erreur lors du chargement du document")
    }
  }

  async getDocuments() {
    try {
      const res = await axios.get(`${this.baseUrl}/api/documents/user`, {
        headers: this.getAuthHeaders(),
      })
      return res.data
    } catch (error: any) {
      throw new Error("Erreur lors du chargement des documents")
    }
  }

  async uploadDocument(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await axios.post(`${this.baseUrl}/api/documents/upload`, formData, {
        headers: this.getAuthHeadersMultipart(),
      })
      return res.data
    } catch (error: any) {
      const msg = error.response?.data?.error || "Erreur lors de l'upload"
      throw new Error(msg)
    }
  }

  async signDocument(documentId: string, signatureText: string, signatureImage?: File) {
    const formData = new FormData()
    formData.append("signatureText", signatureText)

    if (signatureImage) {
      formData.append("signatureImage", signatureImage)
    }

    try {
      const res = await axios.post(`${this.baseUrl}/api/documents/${documentId}/sign`, formData, {
        headers: this.getAuthHeadersMultipart(),
      })
      return res.data
    } catch (error: any) {
      const msg = error.response?.data?.error || "Erreur lors de la signature"
      throw new Error(msg)
    }
  }

  async deleteDocument(id: string) {
    try {
      const res = await axios.delete(`${this.baseUrl}/api/documents/${id}/destroy`, {
        headers: this.getAuthHeaders(),
      })
      return res.data
    } catch (error: any) {
      const msg = error.response?.data?.error || "Erreur lors de la suppression du document"
      throw new Error(msg)
    }
  }
}

export const apiClient = new ApiClient()
