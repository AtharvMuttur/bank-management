"use client"

import { useState } from "react"

import type React from "react"
import { useEffect } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Loan {
  loan_id: number
  type: string
  amount: number
}

interface Service {
  service_id: number
  name: string
  type: string
}

interface Locker {
  locker_id: number
  size: string
  rent: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AccountDetails() {
  const [custId, setCustId] = useState("")
  const [searchCustId, setSearchCustId] = useState("")
  const [totalBalance, setTotalBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const { data, isLoading, error } = useSWR(searchCustId ? `/api/account-details/${searchCustId}` : null, fetcher)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (custId.trim()) {
      setSearchCustId(custId)
    }
  }

  useEffect(() => {
    if (searchCustId) {
      setBalanceLoading(true)
      fetch(`/api/customer-balance/${searchCustId}`)
        .then((res) => res.json())
        .then((data) => {
          setTotalBalance(data.total_balance ? Number(data.total_balance) : 0)
          setBalanceLoading(false)
        })
        .catch(() => {
          setBalanceLoading(false)
        })
    }
  }, [searchCustId])

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Account Details</h3>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="number"
          placeholder="Enter Customer ID"
          value={custId}
          onChange={(e) => setCustId(e.target.value)}
          className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Search
        </button>
      </form>

      {/* Loading State */}
      {isLoading && <p className="text-foreground/60">Loading account details...</p>}

      {/* Error State */}
      {error && <p className="text-red-500">Error loading account details</p>}

      {/* Total Balance Display */}
      {searchCustId && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <p className="text-foreground/60">Loading...</p>
            ) : (
              <p className="text-2xl font-bold text-primary">₹{(totalBalance ?? 0).toFixed(2)}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Details Display */}
      {data && searchCustId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Loans Section */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Loans ({data.loans?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.loans && data.loans.length > 0 ? (
                <div className="space-y-3">
                  {data.loans.map((loan: Loan) => (
                    <div key={loan.loan_id} className="border border-border rounded p-3 bg-background">
                      <p className="text-sm font-medium text-foreground">Loan ID: {loan.loan_id}</p>
                      <p className="text-sm text-foreground/70">Type: {loan.type}</p>
                      <p className="text-sm text-foreground/70">Amount: ₹{Number(loan.amount).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground/60">No loans found</p>
              )}
            </CardContent>
          </Card>

          {/* Services Section */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Services ({data.services?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.services && data.services.length > 0 ? (
                <div className="space-y-3">
                  {data.services.map((service: Service) => (
                    <div key={service.service_id} className="border border-border rounded p-3 bg-background">
                      <p className="text-sm font-medium text-foreground">{service.name}</p>
                      <p className="text-sm text-foreground/70">Type: {service.type}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground/60">No services availed</p>
              )}
            </CardContent>
          </Card>

          {/* Lockers Section */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Lockers ({data.lockers?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.lockers && data.lockers.length > 0 ? (
                <div className="space-y-3">
                  {data.lockers.map((locker: Locker) => (
                    <div key={locker.locker_id} className="border border-border rounded p-3 bg-background">
                      <p className="text-sm font-medium text-foreground">Locker ID: {locker.locker_id}</p>
                      <p className="text-sm text-foreground/70">Size: {locker.size}</p>
                      <p className="text-sm text-foreground/70">Rent: ₹{Number(locker.rent).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground/60">No lockers in use</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!searchCustId && <p className="text-foreground/60 text-sm">Enter a customer ID to view account details</p>}
    </div>
  )
}
