import { Router } from "express"
import { getPool } from "../db"

const router = Router()

// Branch Profitability and Account Type Distribution
router.get("/branch-profitability", async (req, res) => {
  try {
    const pool = getPool()
    const connection = await pool.getConnection()

    const query = `
      SELECT
          B.name AS Branch_Name,
          SUM(A.balance) AS Total_Balance_Value,
          COUNT(A.acc_no) AS Total_Accounts,
          CASE
              WHEN COUNT(A.acc_no) >= 2 THEN 'High Activity'
              ELSE 'Low Activity'
          END AS Activity_Level
      FROM
          Branch B
      LEFT JOIN Account A ON B.branch_id = A.branch_id
      GROUP BY B.branch_id, B.name
      ORDER BY Total_Balance_Value DESC
    `

    const [results] = await connection.execute(query)
    connection.release()
    res.json(results)
  } catch (error) {
    console.error("[v0] Analysis error:", error)
    res.status(500).json({ error: "Analysis query failed" })
  }
})

// Employee Cost and Customer Reach Analysis
router.get("/employee-efficiency", async (req, res) => {
  try {
    const pool = getPool()
    const connection = await pool.getConnection()

    const query = `
      WITH BranchCustomerCounts AS (
          SELECT A.branch_id, COUNT(DISTINCT A.cust_id) AS Total_Customers_Served
          FROM Account A
          GROUP BY A.branch_id
      )
      SELECT
          B.name AS Branch_Name,
          SUM(E.salary) AS Total_Branch_Salary_Cost,
          BCC.Total_Customers_Served,
          SUM(E.salary) / BCC.Total_Customers_Served AS Cost_Per_Customer
      FROM
          Branch B
      JOIN Employee E ON B.branch_id = E.branch_id
      JOIN BranchCustomerCounts BCC ON B.branch_id = BCC.branch_id
      GROUP BY B.branch_id, B.name, BCC.Total_Customers_Served
      ORDER BY Cost_Per_Customer DESC
    `

    const [results] = await connection.execute(query)
    connection.release()
    res.json(results)
  } catch (error) {
    console.error("[v0] Analysis error:", error)
    res.status(500).json({ error: "Analysis query failed" })
  }
})

// New endpoint to get branch account summary using stored procedure
router.get("/branch-summary/:branchId", async (req, res) => {
  try {
    const { branchId } = req.params
    const pool = getPool()
    const connection = await pool.getConnection()

    // Call the stored procedure Get_Branch_Account_Summary
    const [results] = await connection.execute("CALL Get_Branch_Account_Summary(?)", [Number.parseInt(branchId)])

    connection.release()

    console.log("[v0] Stored procedure results:", JSON.stringify(results))

    // The stored procedure returns results in an array of arrays, get the first result set and first row
    const data =
      Array.isArray(results) && results.length > 0 && Array.isArray(results[0]) && results[0].length > 0
        ? results[0][0]
        : null

    console.log("[v0] Parsed data:", data)

    if (!data) {
      return res.status(404).json({ error: "Branch not found" })
    }

    res.json(data)
  } catch (error) {
    console.error("[v0] Branch summary error:", error)
    res.status(500).json({ error: "Failed to fetch branch summary" })
  }
})

export { router as analysisRoutes }
