// Backend authentication middleware
import type { Request, Response, NextFunction } from "express"
import mysql from "mysql2/promise"

export interface AuthRequest extends Request {
  user?: {
    username: string
    role: "admin" | "customer"
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: "root",
  password: process.env.DB_PASSWORD || "Atharv@2012",
  database: process.env.DB_NAME || "BankManagement",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function verifyAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized - No token provided" })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())

    if (!decoded.username) {
      return res.status(401).json({ error: "Invalid token" })
    }

    // Determine role based on username
    const role = decoded.username === "root" ? "admin" : "customer"

    req.user = {
      username: decoded.username,
      role,
    }

    next()
  } catch (error) {
    return res.status(401).json({ error: "Invalid token format" })
  }
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  // First verify the auth token
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized - No token provided" })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())

    if (!decoded.username) {
      return res.status(401).json({ error: "Invalid token" })
    }

    // Determine role based on username
    const role = decoded.username === "root" ? "admin" : "customer"

    // Check if user is admin
    if (role !== "admin") {
      return res.status(403).json({ error: "Forbidden - Admin access required" })
    }

    req.user = {
      username: decoded.username,
      role,
    }

    next()
  } catch (error) {
    return res.status(401).json({ error: "Invalid token format" })
  }
}

export async function validateDatabaseUser(username: string, password: string): Promise<boolean> {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: username,
      password: password || "",
      database: process.env.DB_NAME || "BankManagement",
    })

    await connection.end()
    return true
  } catch (error) {
    console.log("[v0] Auth failed for user:", username)
    return false
  }
}
