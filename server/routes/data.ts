import { Router, type Request, type Response } from "express"
import { getPool } from "../db"

const router = Router()

// Get all customers
router.get("/customers", async (req: Request, res: Response) => {
  try {
    const pool = getPool()
    const connection = await pool.getConnection()
    const [results] = await connection.execute("SELECT * FROM Customer")
    connection.release()
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customers" })
  }
})

// Insert new customer
router.post("/customers", async (req: Request, res: Response) => {
  try {
    const { name, street, city, pincode, DOB } = req.body
    const pool = getPool()
    const connection = await pool.getConnection()

    await connection.execute("INSERT INTO Customer (name, street, city, pincode, DOB) VALUES (?, ?, ?, ?, ?)", [
      name,
      street,
      city,
      pincode,
      DOB,
    ])

    connection.release()
    res.status(201).json({ message: "Customer added successfully" })
  } catch (error) {
    res.status(500).json({ error: "Failed to add customer" })
  }
})

// Get all branches
router.get("/branches", async (req: Request, res: Response) => {
  try {
    const pool = getPool()
    const connection = await pool.getConnection()
    const [results] = await connection.execute("SELECT * FROM Branch")
    connection.release()
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch branches" })
  }
})

// Insert new branch
router.post("/branches", async (req: Request, res: Response) => {
  try {
    const { branch_id, name, location } = req.body
    const pool = getPool()
    const connection = await pool.getConnection()

    await connection.execute("INSERT INTO Branch (branch_id, name, location) VALUES (?, ?, ?)", [
      branch_id,
      name,
      location,
    ])

    connection.release()
    res.status(201).json({ message: "Branch added successfully" })
  } catch (error) {
    res.status(500).json({ error: "Failed to add branch" })
  }
})

// Get all accounts
router.get("/accounts", async (req: Request, res: Response) => {
  try {
    const pool = getPool()
    const connection = await pool.getConnection()
    const [results] = await connection.execute("SELECT * FROM Account")
    connection.release()
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch accounts" })
  }
})

// Insert new account
router.post("/accounts", async (req: Request, res: Response) => {
  try {
    const { type, balance, cust_id, branch_id } = req.body
    const pool = getPool()
    const connection = await pool.getConnection()

    await connection.execute("INSERT INTO Account (type, balance, cust_id, branch_id) VALUES (?, ?, ?, ?)", [
      type,
      balance,
      cust_id,
      branch_id,
    ])

    connection.release()
    res.status(201).json({ message: "Account added successfully" })
  } catch (error) {
    res.status(500).json({ error: "Failed to add account" })
  }
})

export { router as dataRoutes }
