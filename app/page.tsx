"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import Dashboard from "@/components/dashboard"
import QueryExecutor from "@/components/query-executor"
import DataManager from "@/components/data-manager"
import BranchSummary from "@/components/branch-summary"
import Login from "../components/login"
import { getAuthSession, clearAuthSession, isAdmin } from "../lib/auth"

export default function Home() {
  const [currentSection, setCurrentSection] = useState("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getAuthSession()
    if (session) {
      setIsAuthenticated(true)
      setUser({ username: session.user, role: session.role })
    }
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={() => {
          const session = getAuthSession()
          if (session) {
            setIsAuthenticated(true)
            setUser({ username: session.user, role: session.role })
          }
        }}
      />
    )
  }

  const renderSection = () => {
    switch (currentSection) {
      case "dashboard":
        return <Dashboard />
      case "queries":
        return isAdmin() ? (
          <QueryExecutor />
        ) : (
          <div className="text-center py-12 text-foreground/60">Admin access required</div>
        )
      case "data":
        return <DataManager />
      case "branch-summary":
        return isAdmin() ? (
          <BranchSummary />
        ) : (
          <div className="text-center py-12 text-foreground/60">Admin access required</div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        user={user}
        onLogout={() => {
          clearAuthSession()
          setIsAuthenticated(false)
          setUser(null)
        }}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">{renderSection()}</main>
    </div>
  )
}
