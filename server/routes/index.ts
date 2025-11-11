import type { Express } from "express"
import { queryRoutes } from "./queries"
import { dataRoutes } from "./data"
import { analysisRoutes } from "./analysis"
import { transactionRoutes } from "./transactions"
import { accountDetailsRoutes } from "./account-details"
import { customerBalanceRoutes } from "./customer-balance"
import { authRoutes } from "./auth"

export function setupRoutes(app: Express) {
  app.use("/api/auth", authRoutes)

  // Dashboard and transaction endpoints are available to all authenticated users
  app.use("/api/transactions", transactionRoutes)
  app.use("/api/account-details", accountDetailsRoutes)
  app.use("/api/customer-balance", customerBalanceRoutes)

  // Query endpoints - admin only
  app.use("/api/queries", queryRoutes)

  // Data management endpoints - admin only
  app.use("/api/data", dataRoutes)

  // Analysis endpoints - admin only
  app.use("/api/analysis", analysisRoutes)

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" })
  })
}
