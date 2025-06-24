// lib/nprogress.ts
import NProgress from "nprogress"
import "nprogress/nprogress.css"

// Configuration optionnelle
NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.1 })

export default NProgress
