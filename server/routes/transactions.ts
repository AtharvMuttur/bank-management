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

// Transfer money between accounts
router.post("/transfer", async (req: Request, res: Response) => {
  try {
    const { from_acc_no, to_acc_no, amount } = req.body
    console.log("[v0] Transfer request received:", { from_acc_no, to_acc_no, amount, timestamp: new Date().toISOString() })

    // Validation
    if (!from_acc_no || !to_acc_no || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid account numbers or amount" })
    }

    if (from_acc_no === to_acc_no) {
      return res.status(400).json({ error: "Cannot transfer to the same account" })
    }

    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Lock and fetch source account
      const [fromAccountResults] = await connection.execute<Account[]>(
        "SELECT acc_no, balance FROM Account WHERE acc_no = ? LIMIT 1 FOR UPDATE",
        [from_acc_no],
      )

      if (!Array.isArray(fromAccountResults) || fromAccountResults.length === 0) {
        await connection.rollback()
        return res.status(404).json({ error: "Source account not found" })
      }

      // Lock and fetch destination account
      const [toAccountResults] = await connection.execute<Account[]>(
        "SELECT acc_no, balance FROM Account WHERE acc_no = ? LIMIT 1 FOR UPDATE",
        [to_acc_no],
      )

      if (!Array.isArray(toAccountResults) || toAccountResults.length === 0) {
        await connection.rollback()
        return res.status(404).json({ error: "Destination account not found" })
      }

      const fromAccount = fromAccountResults[0]
      const toAccount = toAccountResults[0]
      const fromBalance = Number(fromAccount.balance)
      
      console.log("[v0] Source account balance:", { from_acc_no, fromBalance })

      // Check if sufficient balance
      if (fromBalance < amount) {
        await connection.rollback()
        return res.status(400).json({ error: "Insufficient balance in source account" })
      }

      // Update balances for both accounts
      const [decResult] = await connection.execute(
        "UPDATE Account SET balance = balance - ? WHERE acc_no = ?",
        [amount, from_acc_no],
      )

      const [incResult] = await connection.execute(
        "UPDATE Account SET balance = balance + ? WHERE acc_no = ?",
        [amount, to_acc_no],
      )

      // Optional: verify updates affected rows
      // If either update didn't affect a row, rollback
      if ((decResult as any).affectedRows === 0 || (incResult as any).affectedRows === 0) {
        await connection.rollback()
        return res.status(500).json({ error: "Failed to update account balances" })
      }

      // Get next transaction IDs for both accounts
      const [fromTransResults] = await connection.execute<Transaction[]>(
        "SELECT IFNULL(MAX(trans_id), 0) + 1 as next_id FROM Transaction WHERE acc_no = ? LIMIT 1",
        [from_acc_no],
      )
      const fromTransId = Array.isArray(fromTransResults) && fromTransResults.length > 0 
        ? Number((fromTransResults[0] as any).next_id) || 1 
        : 1

      const [toTransResults] = await connection.execute<Transaction[]>(
        "SELECT IFNULL(MAX(trans_id), 0) + 1 as next_id FROM Transaction WHERE acc_no = ? LIMIT 1",
        [to_acc_no],
      )
      const toTransId = Array.isArray(toTransResults) && toTransResults.length > 0 
        ? Number((toTransResults[0] as any).next_id) || 1 
        : 1

      // Insert transfer transactions (type must be 'Transfer' to satisfy CHECK constraint)
      await connection.execute(
        "INSERT INTO Transaction (acc_no, trans_id, amount, type, mode, date) VALUES (?, ?, ?, ?, ?, NOW())",
        [from_acc_no, fromTransId, amount, "Transfer", "Online"],
      )

      await connection.execute(
        "INSERT INTO Transaction (acc_no, trans_id, amount, type, mode, date) VALUES (?, ?, ?, ?, ?, NOW())",
        [to_acc_no, toTransId, amount, "Transfer", "Online"],
      )

      await connection.commit()

      // Fetch updated balances
      const [fromUpdatedResults] = await connection.execute<Account[]>(
        "SELECT balance FROM Account WHERE acc_no = ? LIMIT 1",
        [from_acc_no],
      )
      const [toUpdatedResults] = await connection.execute<Account[]>(
        "SELECT balance FROM Account WHERE acc_no = ? LIMIT 1",
        [to_acc_no],
      )

      const newFromBalance = Array.isArray(fromUpdatedResults) ? Number(fromUpdatedResults[0].balance) : fromBalance - amount
      const newToBalance = Array.isArray(toUpdatedResults) ? Number(toUpdatedResults[0].balance) : Number(toAccount.balance) + amount

      console.log("[v0] Transfer successful:", { from_acc_no, to_acc_no, amount, newFromBalance, newToBalance })

      res.json({ 
        message: "Transfer successful", 
        fromBalance: newFromBalance,
        toBalance: newToBalance,
        amount 
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("[v0] Transfer error:", error)
    res.status(500).json({ error: "Transfer failed" })
  }
})

export { router as transactionRoutes }
