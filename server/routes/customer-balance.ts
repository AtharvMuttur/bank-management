import { Router } from "express"
import { getPool } from "../db"

const router = Router()

// Get total balance for a customer using the get_total_balance function
router.get("/:custId", async (req, res) => {
  try {
    const { custId } = req.params
    const pool = getPool()
    const connection = await pool.getConnection()

    const [results] = await connection.execute<any[]>("SELECT get_total_balance(?) as total_balance", [custId])

    connection.release()

    if (results && results.length > 0) {
      const totalBalance = results[0].total_balance || 0
      res.json({ total_balance: totalBalance })
    } else {
      res.json({ total_balance: 0 })
    }
  } catch (error) {
    console.error("Error fetching customer balance:", error)
    res.status(500).json({ error: "Failed to fetch customer balance" })
  }
})

export const customerBalanceRoutes = router
