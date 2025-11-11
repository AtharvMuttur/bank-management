"use client"

import type React from "react"
import { getAuthSession } from "../lib/auth"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"

interface BalanceInfo {
  acc_no: string
  balance: number
  type: string
  cust_id: number
}

export default function TransactionManager() {
  const [activeTab, setActiveTab] = useState<"balance" | "deposit" | "withdraw">("balance")
  const [accountNumber, setAccountNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const resetMessages = () => {
    setMessage("")
    setError("")
  }

  const getAuthHeaders = () => {
    const session = getAuthSession()
    return session ? { Authorization: `Bearer ${session.token}` } : {}
  }

  const handleCheckBalance = async (e: React.FormEvent) => {
    e.preventDefault()
    resetMessages()

    if (!accountNumber.trim()) {
      setError("Please enter an account number")
      return
    }

    setLoading(true)
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const response = await fetch(`${API_URL}/api/transactions/balance/${accountNumber}`, {
        headers: getAuthHeaders(),
        signal: abortControllerRef.current.signal,
      })
      if (!response.ok) {
        throw new Error("Account not found")
      }
      const data = await response.json()
      setBalanceInfo(data)
      setMessage(`Balance for Account ${data.acc_no}: ₹${Number(data.balance).toFixed(2)}`)
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Failed to fetch balance")
        setBalanceInfo(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    resetMessages()

    if (!accountNumber.trim() || !amount.trim()) {
      setError("Please enter account number and amount")
      return
    }

    const depositAmount = Number.parseFloat(amount)
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError("Amount must be a positive number")
      return
    }

    if (loading) {
      return
    }

    setLoading(true)
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const response = await fetch(`${API_URL}/api/transactions/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ acc_no: accountNumber, amount: depositAmount }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Deposit failed")
      }

      const data = await response.json()
      setMessage(`Deposit successful! New balance: ₹${Number(data.newBalance).toFixed(2)}`)
      setAmount("")
      setBalanceInfo(null)
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Deposit failed")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    resetMessages()

    if (!accountNumber.trim() || !amount.trim()) {
      setError("Please enter account number and amount")
      return
    }

    const withdrawAmount = Number.parseFloat(amount)
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError("Amount must be a positive number")
      return
    }

    if (loading) {
      return
    }

    setLoading(true)
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const response = await fetch(`${API_URL}/api/transactions/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ acc_no: accountNumber, amount: withdrawAmount }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Withdrawal failed")
      }

      const data = await response.json()
      setMessage(`Withdrawal successful! New balance: ₹${Number(data.newBalance).toFixed(2)}`)
      setAmount("")
      setBalanceInfo(null)
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Withdrawal failed")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Account Transactions</h2>

      <div className="flex gap-2 border-b border-border">
        {[
          { id: "balance", label: "Check Balance" },
          { id: "deposit", label: "Deposit Money" },
          { id: "withdraw", label: "Withdraw Money" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any)
              resetMessages()
            }}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary font-medium"
                : "border-transparent text-foreground/60 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="p-6 border border-border bg-card">
        {activeTab === "balance" && (
          <form onSubmit={handleCheckBalance} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "Checking..." : "Check Balance"}
            </Button>

            {balanceInfo && (
              <div className="mt-6 p-4 bg-card border border-border rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Account Information</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Account Number:</span>
                    <span className="font-medium">{balanceInfo.acc_no}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Account Type:</span>
                    <span className="font-medium">{balanceInfo.type}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-foreground/60 font-medium">Current Balance:</span>
                    <span className="font-bold text-accent">₹{Number(balanceInfo.balance).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </form>
        )}

        {activeTab === "deposit" && (
          <form onSubmit={handleDeposit} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Deposit Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {loading ? "Processing..." : "Deposit Money"}
            </Button>
          </form>
        )}

        {activeTab === "withdraw" && (
          <form onSubmit={handleWithdraw} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Withdrawal Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Processing..." : "Withdraw Money"}
            </Button>
          </form>
        )}

        {message && (
          <div className="mt-6 p-4 bg-accent/10 border border-accent rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-accent font-medium">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-destructive font-medium">{error}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
