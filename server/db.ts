import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Atharv@2012",
  database: process.env.DB_NAME || "bankmanagement",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection()
    console.log("[v0] Database connected successfully")
    connection.release()
  } catch (error) {
    console.error("[v0] Database connection error:", error)
    throw error
  }
}

export function getPool() {
  return pool
}

export async function executeQuery(query: string, values?: any[]) {
  const connection = await pool.getConnection()
  try {
    const [results] = await connection.execute(query, values || [])
    return results
  } finally {
    connection.release()
  }
}
