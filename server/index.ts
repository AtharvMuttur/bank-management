import express from "express"
import cors from "cors"
import { initializeDatabase } from "./db"
import { setupRoutes } from "./routes"

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Initialize database
async function startServer() {
  try {
    await initializeDatabase()
    setupRoutes(app)

    app.listen(PORT, () => {
      console.log(`[v0] Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error("[v0] Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
