import { Router, type Request, type Response } from "express"
import { getPool } from "../db"
import type { RowDataPacket } from "mysql2/promise"

const router = Router()

interface Account extends RowDataPacket {
  acc_no: string
  balance: number
  type: string
  cust_id: string
}

interface Transaction extends RowDataPacket {
  trans_id: number
}

// Get account balance
router.get("/balance/:acc_no", async (req: Request, res: Response) => {
  try {
    const { acc_no } = req.params
    const pool = getPool()
    const connection = await pool.getConnection()

    const [results] = await connection.execute<Account[]>(
      "SELECT acc_no, balance, type, cust_id FROM Account WHERE acc_no = ?",
      [acc_no],
    )

    connection.release()

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(404).json({ error: "Account not found" })
    }

    res.json(results[0])
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch balance" })
  }
})

// Deposit money
router.post("/deposit", async (req: Request, res: Response) => {
  try {
    const { acc_no, amount } = req.body
    console.log("[v0] Deposit request received:", { acc_no, amount, timestamp: new Date().toISOString() })

    // Validation
    if (!acc_no || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid account number or amount" })
    }

    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [accountResults] = await connection.execute<Account[]>(
        "SELECT balance FROM Account WHERE acc_no = ? LIMIT 1 FOR UPDATE",
        [acc_no],
      )

      if (!Array.isArray(accountResults) || accountResults.length === 0) {
        await connection.rollback()
        return res.status(404).json({ error: "Account not found" })
      }

      const currentBalance = Number(accountResults[0].balance)
      console.log("[v0] Current balance:", { acc_no, currentBalance })

      // Get the next transaction ID
      const [transResults] = await connection.execute<Transaction[]>(
        "SELECT IFNULL(MAX(trans_id), 0) + 1 as next_id FROM Transaction WHERE acc_no = ? LIMIT 1",
        [acc_no],
      )

      let transId = 1
      if (Array.isArray(transResults) && transResults.length > 0) {
        transId = Number((transResults[0] as any).next_id) || 1
      }

      // Insert transaction record
      const insertResult = await connection.execute(
        "INSERT INTO Transaction (acc_no, trans_id, amount, type, mode, date) VALUES (?, ?, ?, ?, ?, NOW())",
        [acc_no, transId, amount, "Deposit", "Online"],
      )
      console.log("[v0] Transaction inserted:", {
        acc_no,
        transId,
        amount,
        insertResult: (insertResult[0] as any).affectedRows,
      })

      await connection.commit()

      // Fetch the updated balance to return
      const [updatedResults] = await connection.execute<Account[]>(
        "SELECT balance FROM Account WHERE acc_no = ? LIMIT 1",
        [acc_no],
      )

      const updatedBalance = Array.isArray(updatedResults) ? Number(updatedResults[0].balance) : currentBalance + amount
      console.log("[v0] Final balance:", { acc_no, updatedBalance })

      res.json({ message: "Deposit successful", newBalance: updatedBalance, amount })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("[v0] Deposit error:", error)
    res.status(500).json({ error: "Deposit failed" })
  }
})

// Withdraw money
router.post("/withdraw", async (req: Request, res: Response) => {
  try {
    const { acc_no, amount } = req.body
    console.log("[v0] Withdraw request received:", { acc_no, amount, timestamp: new Date().toISOString() })

    // Validation
    if (!acc_no || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid account number or amount" })
    }

    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [accountResults] = await connection.execute<Account[]>(
        "SELECT balance FROM Account WHERE acc_no = ? LIMIT 1 FOR UPDATE",
        [acc_no],
      )

      if (!Array.isArray(accountResults) || accountResults.length === 0) {
        await connection.rollback()
        return res.status(404).json({ error: "Account not found" })
      }

      const currentBalance = Number(accountResults[0].balance)
      console.log("[v0] Current balance:", { acc_no, currentBalance })

      // Check if sufficient balance
      if (currentBalance < amount) {
        await connection.rollback()
        return res.status(400).json({ error: "Insufficient balance" })
      }

      // Get the next transaction ID
      const [transResults] = await connection.execute<Transaction[]>(
        "SELECT IFNULL(MAX(trans_id), 0) + 1 as next_id FROM Transaction WHERE acc_no = ? LIMIT 1",
        [acc_no],
      )

      let transId = 1
      if (Array.isArray(transResults) && transResults.length > 0) {
        transId = Number((transResults[0] as any).next_id) || 1
      }

      // Insert transaction record
      const insertResult = await connection.execute(
        "INSERT INTO Transaction (acc_no, trans_id, amount, type, mode, date) VALUES (?, ?, ?, ?, ?, NOW())",
        [acc_no, transId, amount, "Withdrawal", "Online"],
      )
      console.log("[v0] Transaction inserted:", {
        acc_no,
        transId,
        amount,
        insertResult: (insertResult[0] as any).affectedRows,
      })

      await connection.commit()

      // Fetch the updated balance to return
      const [updatedResults] = await connection.execute<Account[]>(
        "SELECT balance FROM Account WHERE acc_no = ? LIMIT 1",
        [acc_no],
      )

      const updatedBalance = Array.isArray(updatedResults) ? Number(updatedResults[0].balance) : currentBalance - amount
      console.log("[v0] Final balance:", { acc_no, updatedBalance })

      res.json({ message: "Withdrawal successful", newBalance: updatedBalance, amount })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("[v0] Withdraw error:", error)
    res.status(500).json({ error: "Withdrawal failed" })
  }
})

export { router as transactionRoutes }
