"use client"

import type React from "react"

import { useState } from "react"
import { AlertCircle, CheckCircle } from "lucide-react"

interface ValidationError {
  field: string
  message: string
}

export default function AccountForm() {
  const [formData, setFormData] = useState({
    type: "Savings",
    balance: "",
    cust_id: "",
    branch_id: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [showRecords, setShowRecords] = useState(false)
  const [records, setRecords] = useState<any[]>([])

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = []

    if (!formData.balance || Number(formData.balance) < 0) {
      newErrors.push({ field: "balance", message: "Balance must be a non-negative number" })
    }
    if (!formData.cust_id || Number(formData.cust_id) <= 0) {
      newErrors.push({ field: "cust_id", message: "Customer ID must be a positive number" })
    }
    if (!formData.branch_id || Number(formData.branch_id) <= 0) {
      newErrors.push({ field: "branch_id", message: "Branch ID must be a positive number" })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => prev.filter((err) => err.field !== name))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setMessage("")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          balance: Number.parseFloat(formData.balance),
          cust_id: Number.parseInt(formData.cust_id),
          branch_id: Number.parseInt(formData.branch_id),
        }),
      })

      if (!response.ok) throw new Error("Failed to add account")

      setMessageType("success")
      setMessage("Account added successfully!")
      setFormData({ type: "Savings", balance: "", cust_id: "", branch_id: "" })
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      setMessageType("error")
      setMessage("Error adding account")
      console.error("[v0] Account form error:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecords = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data/accounts`)
      if (!response.ok) throw new Error("Failed to fetch records")
      const data = await response.json()
      setRecords(data)
      setShowRecords(!showRecords)
    } catch (err) {
      console.error("[v0] Error fetching account records:", err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Account Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-background border border-border rounded text-foreground focus:border-primary focus:outline-none transition"
          >
            <option value="Savings">Savings</option>
            <option value="Current">Current</option>
            <option value="Fixed Deposit">Fixed Deposit</option>
            <option value="Recurring Deposit">Recurring Deposit</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Initial Balance *</label>
          <input
            type="number"
            step="0.01"
            name="balance"
            placeholder="Enter initial balance"
            value={formData.balance}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-background border border-border rounded text-foreground placeholder-foreground/40 focus:border-primary focus:outline-none transition"
          />
          {errors.find((e) => e.field === "balance") && (
            <p className="text-destructive text-xs mt-1">{errors.find((e) => e.field === "balance")?.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Customer ID *</label>
            <input
              type="number"
              name="cust_id"
              placeholder="Enter customer ID"
              value={formData.cust_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-background border border-border rounded text-foreground placeholder-foreground/40 focus:border-primary focus:outline-none transition"
            />
            {errors.find((e) => e.field === "cust_id") && (
              <p className="text-destructive text-xs mt-1">{errors.find((e) => e.field === "cust_id")?.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Branch ID *</label>
            <input
              type="number"
              name="branch_id"
              placeholder="Enter branch ID"
              value={formData.branch_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-background border border-border rounded text-foreground placeholder-foreground/40 focus:border-primary focus:outline-none transition"
            />
            {errors.find((e) => e.field === "branch_id") && (
              <p className="text-destructive text-xs mt-1">{errors.find((e) => e.field === "branch_id")?.message}</p>
            )}
          </div>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded text-sm ${
              messageType === "success"
                ? "bg-accent/10 text-accent border border-accent"
                : "bg-destructive/10 text-destructive border border-destructive"
            }`}
          >
            {messageType === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message}
          </div>
        )}

        {/* View Records button */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? "Adding..." : "Add Account"}
          </button>
          <button
            type="button"
            onClick={fetchRecords}
            className="px-4 py-2 bg-background border border-border text-foreground rounded hover:bg-background/80 transition flex items-center gap-2"
          >
            {showRecords ? "Hide" : "View"} Records
          </button>
        </div>
      </form>

      {/* Records Section */}
      {showRecords && records.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Account Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {Object.keys(records[0]).map((key) => (
                    <th key={key} className="text-left py-3 px-4 text-foreground/80 font-semibold">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((row, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-background/50 transition">
                    {Object.values(row).map((val, cidx) => (
                      <td key={cidx} className="py-3 px-4 text-foreground">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-foreground/60">Total records: {records.length}</div>
        </div>
      )}
    </div>
  )
}
