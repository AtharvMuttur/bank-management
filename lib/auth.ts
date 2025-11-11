// Client-side auth utilities and types
export interface AuthSession {
  user: string
  role: "admin" | "customer"
  token: string
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null
  const session = localStorage.getItem("authSession")
  return session ? JSON.parse(session) : null
}

export function setAuthSession(session: AuthSession) {
  localStorage.setItem("authSession", JSON.stringify(session))
}

export function clearAuthSession() {
  localStorage.removeItem("authSession")
}

export function isAdmin(): boolean {
  const session = getAuthSession()
  return session?.role === "admin"
}

export function isCustomer(): boolean {
  const session = getAuthSession()
  return session?.role === "customer"
}

export function isAuthenticated(): boolean {
  return getAuthSession() !== null
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  const session = getAuthSession()
  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`
  }

  return headers
}
