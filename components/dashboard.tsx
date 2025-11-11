"use client"

import { useEffect, useState } from "react"
import { getAuthSession } from "@/lib/auth"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface BranchData {
  Branch_Name: string
  Total_Balance_Value: number
  Total_Accounts: number
  Activity_Level: string
}

interface EfficiencyData {
  Branch_Name: string
  Total_Branch_Salary_Cost: number
  Total_Customers_Served: number
  Cost_Per_Customer: number | string
}

export default function Dashboard() {
  const [branchData, setBranchData] = useState<BranchData[]>([])
  const [efficiencyData, setEfficiencyData] = useState<EfficiencyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  const getAuthHeaders = (): HeadersInit => {
    const session = getAuthSession()
    if (!session) {
      console.warn("[v0] No auth session found")
      return {
        "Content-Type": "application/json",
      }
    }
    return {
      Authorization: `Bearer ${session.token}`,
      "Content-Type": "application/json",
    }
  }

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const headers = getAuthHeaders()

        console.log("[v0] Dashboard fetching with headers:", Object.keys(headers))

        const [branchRes, efficiencyRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analysis/branch-profitability`, {
            method: "GET",
            headers,
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analysis/employee-efficiency`, {
            method: "GET",
            headers,
          }),
        ])

        if (!branchRes.ok) {
          console.error("[v0] Branch res status:", branchRes.status)
          throw new Error(`Failed to fetch branch data: ${branchRes.status}`)
        }
        if (!efficiencyRes.ok) {
          console.error("[v0] Efficiency res status:", efficiencyRes.status)
          throw new Error(`Failed to fetch efficiency data: ${efficiencyRes.status}`)
        }

        const branchResult = await branchRes.json()
        const efficiencyResult = await efficiencyRes.json()

        console.log("[v0] Analytics data fetched successfully")
        setBranchData(branchResult)
        setEfficiencyData(efficiencyResult)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An error occurred"
        console.error("[v0] Dashboard fetch error:", errorMsg)
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-foreground/60">Loading analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded">Error: {error}</div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branch Profitability Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Branch Profitability</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="Branch_Name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                formatter={(value) => (typeof value === "number" ? `$${value.toLocaleString()}` : value)}
              />
              <Legend />
              <Bar dataKey="Total_Balance_Value" fill="#3b82f6" name="Total Balance" />
              <Bar dataKey="Total_Accounts" fill="#10b981" name="Total Accounts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Level Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Activity Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={branchData}
                dataKey="Total_Accounts"
                nameKey="Branch_Name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {branchData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffffff", border: "1px solid #334155", borderRadius: "8px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employee Efficiency */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Employee Cost Efficiency</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-foreground/80">Branch Name</th>
                <th className="text-right py-3 px-4 text-foreground/80">Salary Cost</th>
                <th className="text-right py-3 px-4 text-foreground/80">Customers Served</th>
                <th className="text-right py-3 px-4 text-foreground/80">Cost Per Customer</th>
              </tr>
            </thead>
            <tbody>
              {efficiencyData.map((row, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-background/50 transition">
                  <td className="py-3 px-4 text-foreground">{row.Branch_Name}</td>
                  <td className="text-right py-3 px-4 text-foreground">
                    ${row.Total_Branch_Salary_Cost?.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-foreground">{row.Total_Customers_Served}</td>
                  <td className="text-right py-3 px-4 text-accent">${Number(row.Cost_Per_Customer).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
