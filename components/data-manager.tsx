"use client"

import { useState, useEffect } from "react"
import { isAdmin } from "@/lib/auth"
import CustomerForm from "./forms/customer-form"
import AccountForm from "./forms/account-form"
import TransactionManager from "./transaction-manager"
import AccountDetails from "./account-details"
import BranchForm from "./forms/branch-form"

export default function DataManager() {
  const [activeTab, setActiveTab] = useState("customers")
  const [isAdminUser, setIsAdminUser] = useState(false)

  useEffect(() => {
    setIsAdminUser(isAdmin())
  }, [])

  const baseTabs = [
    { id: "customers", label: "Customers", component: CustomerForm },
    { id: "accounts", label: "Accounts", component: AccountForm },
    { id: "transactions", label: "Transactions", component: TransactionManager },
  ]

  const adminTabs = [
    { id: "accountDetails", label: "Account Details", component: AccountDetails },
    { id: "branches", label: "Branches", component: BranchForm },
  ]

  const tabs = isAdminUser ? [...baseTabs, ...adminTabs] : baseTabs

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Data Management</h2>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-foreground/60 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-card border border-border rounded-lg p-6">
        {tabs.find((tab) => tab.id === activeTab) &&
          (() => {
            const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component
            return ActiveComponent ? <ActiveComponent /> : null
          })()}
      </div>
    </div>
  )
}
