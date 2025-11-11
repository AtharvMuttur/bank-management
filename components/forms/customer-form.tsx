"use client"

import type React from "react"

import { useState } from "react"
import { AlertCircle, CheckCircle } from "lucide-react"

interface ValidationError {
  field: string
  message: string
}

export default function CustomerForm() {
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    pincode: "",
    DOB: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [showRecords, setShowRecords] = useState(false)
  const [records, setRecords] = useState<any[]>([])

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = []

    if (!formData.name.trim()) {
      newErrors.push({ field: "name", message: "Name is required" })
    } else if (formData.name.length < 2) {
      newErrors.push({ field: "name", message: "Name must be at least 2 characters" })
    }
    if (formData.pincode && !/^\d{5,6}$/.test(formData.pincode)) {
      newErrors.push({ field: "pincode", message: "Pincode must be 5-6 digits" })
    }
    if (formData.DOB) {
      const dob = new Date(formData.DOB)
      const age = new Date().getFullYear() - dob.getFullYear()
      if (age < 18) {
        newErrors.push({ field: "DOB", message: "Customer must be at least 18 years old" })
      }
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to add customer")

      setMessageType("success")
      setMessage("Customer added successfully!")
      setFormData({ name: "", street: "", city: "", pincode: "", DOB: "" })
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      setMessageType("error")
      setMessage("Error adding customer")
      console.error("[v0] Customer form error:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecords = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data/customers`)
      if (!response.ok) throw new Error("Failed to fetch records")
      const data = await response.json()
      setRecords(data)
      setShowRecords(!showRecords)
    } catch (err) {
      console.error("[v0] Error fetching customer records:", err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
          <input
            type="text"
            name="name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-background border border-border rounded text-foreground placeholder-foreground/40 focus:border-primary focus:outline-none transition"
          />
          {errors.find((e) => e.field === "name") && (
            <p className="text-destructive text-xs mt-1">{errors.find((e) => e.field === "name")?.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Street Address</label>
          <input
            type="text"
            name="street"
            placeholder="Enter street address"
            value={formData.street}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-background border border-border rounded text-foreground placeholder-foreground/40 focus:border-primary focus:outline-none transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">City</label>
            <input
              type="text"
              name="city"
              placeholder="Enter city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border border-border rounded text-foreground placeholder-foreground/40 focus:border-primary focus:outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Pincode</label>
            <input
              type="text"
              name="pincode"
              placeholder="Enter 5-6 digit pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border border-border rounded text-foreground placeholder-foreground/40 focus:border-primary focus:outline-none transition"
            />
            {errors.find((e) => e.field === "pincode") && (
              <p className="text-destructive text-xs mt-1">{errors.find((e) => e.field === "pincode")?.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Date of Birth</label>
          <input
            type="date"
            name="DOB"
            value={formData.DOB}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-background border border-border rounded text-foreground focus:border-primary focus:outline-none transition"
          />
          {errors.find((e) => e.field === "DOB") && (
            <p className="text-destructive text-xs mt-1">{errors.find((e) => e.field === "DOB")?.message}</p>
          )}
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

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? "Adding..." : "Add Customer"}
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
          <h3 className="text-lg font-bold text-foreground mb-4">Customer Records</h3>
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
