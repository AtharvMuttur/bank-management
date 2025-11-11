import { Router } from "express"
import { getPool } from "../db"
import type { RowDataPacket } from "mysql2/promise"

const router = Router()

interface Loan extends RowDataPacket {
  loan_id: number
  type: string
  amount: number
}

interface Service extends RowDataPacket {
  service_id: number
  name: string
  type: string
}

interface Locker extends RowDataPacket {
  locker_id: number
  size: string
  rent: number
}

// Get account details including loans, services, and lockers
router.get("/:custId", async (req, res) => {
  try {
    const { custId } = req.params
    const pool = getPool()

    const connection = await pool.getConnection()

    // Get loans for customer
    const [loans] = await connection.execute<Loan[]>("SELECT loan_id, type, amount FROM Loan WHERE cust_id = ?", [
      custId,
    ])

    // Get services availed by customer
    const [services] = await connection.execute<Service[]>(
      `SELECT s.service_id, s.name, s.type 
       FROM Service s
       INNER JOIN Avails a ON s.service_id = a.service_id
       WHERE a.cust_id = ?`,
      [custId],
    )

    // Get lockers used by customer
    const [lockers] = await connection.execute<Locker[]>("SELECT locker_id, size, rent FROM Locker WHERE cust_id = ?", [
      custId,
    ])

    connection.release()

    res.json({
      loans: loans || [],
      services: services || [],
      lockers: lockers || [],
    })
  } catch (error) {
    console.error("Error fetching account details:", error)
    res.status(500).json({ error: "Failed to fetch account details" })
  }
})

export const accountDetailsRoutes = router
