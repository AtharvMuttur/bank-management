import { Router } from "express"
import { getPool } from "../db"

const router = Router()

// Query 1: Customers with High-Value Loans AND Large Lockers
router.post("/high-value-customers", async (req, res) => {
  try {
    const pool = getPool()
    const connection = await pool.getConnection()

    const query = `
      SELECT
    C.name AS Customer_Name,
    C.cust_id,
    SUM(L.amount) AS Total_Loan_Amount,
    GROUP_CONCAT(DISTINCT LR.size ORDER BY FIELD(LR.size, 'Extra Large', 'Large', 'Medium', 'Small')) AS Locker_Sizes
FROM
    Customer C
JOIN
    Loan L ON C.cust_id = L.cust_id
JOIN
    Locker LR ON C.cust_id = LR.cust_id
GROUP BY
    C.cust_id, C.name
HAVING
    SUM(L.amount) > 1000000.00
    AND
    SUM(CASE WHEN LR.size IN ('Large', 'Extra Large') THEN 1 ELSE 0 END) > 0;
    `

    const [results] = await connection.execute(query)
    connection.release()
    res.json(results)
  } catch (error) {
    console.error("[v0] Query error:", error)
    res.status(500).json({ error: "Query execution failed" })
  }
})

// Query 2: Branches Without a Specific Account Type
router.post("/branches-without-account-type", async (req, res) => {
  try {
    const pool = getPool()
    const connection = await pool.getConnection()

    const query = `
      SELECT
          B.name AS Branch_Name,
          B.location
      FROM
          Branch B
      WHERE
          B.branch_id NOT IN (
              SELECT DISTINCT branch_id FROM Account
              WHERE type = 'Recurring Deposit'
          )
    `

    const [results] = await connection.execute(query)
    connection.release()
    res.json(results)
  } catch (error) {
    console.error("[v0] Query error:", error)
    res.status(500).json({ error: "Query execution failed" })
  }
})

// Query 3: Financially Stressed Customers
router.post("/stressed-customers", async (req, res) => {
  try {
    const pool = getPool()
    const connection = await pool.getConnection()

    const query = `
      SELECT
          C.name AS Customer_Name,
          L.Total_Loan_Amount,
          get_total_balance(C.cust_id) AS Total_Account_Balance
      FROM
          Customer C
      JOIN (
          SELECT cust_id, SUM(amount) AS Total_Loan_Amount
          FROM Loan
          GROUP BY cust_id
      ) L ON C.cust_id = L.cust_id
      WHERE
          L.Total_Loan_Amount > get_total_balance(C.cust_id)
      ORDER BY
          L.Total_Loan_Amount DESC
    `

    const [results] = await connection.execute(query)
    connection.release()
    res.json(results)
  } catch (error) {
    console.error("[v0] Query error:", error)
    res.status(500).json({ error: "Query execution failed" })
  }
})

// Query 4: Employees in the Least Active Branch
router.post("/least-active-branch-employees", async (req, res) => {
  try {
    const pool = getPool()
    const connection = await pool.getConnection()

    const query = `
      SELECT
          E.name AS Employee_Name,
          E.position,
          B.name AS Branch_Name
      FROM
          Employee E
      JOIN Branch B ON E.branch_id = B.branch_id
      WHERE
          E.branch_id = (
              SELECT branch_id FROM Account
              GROUP BY branch_id
              ORDER BY SUM(balance) ASC
              LIMIT 1
          )
      ORDER BY E.position, E.name
    `

    const [results] = await connection.execute(query)
    connection.release()
    res.json(results)
  } catch (error) {
    console.error("[v0] Query error:", error)
    res.status(500).json({ error: "Query execution failed" })
  }
})

// Query 5: Digital Adoption Gap
router.post("/digital-adoption-gap", async (req, res) => {
  try {
    const pool = getPool()
    const connection = await pool.getConnection()

    const query = `
      WITH DigitalCustomers AS (
          SELECT DISTINCT A.cust_id
          FROM Avails A
          JOIN Service S ON A.service_id = S.service_id
          WHERE S.type = 'Digital'
      )
      SELECT
          C.name AS Customer_Name,
          C.cust_id
      FROM Customer C
      JOIN DigitalCustomers DC ON C.cust_id = DC.cust_id
      WHERE C.cust_id NOT IN (
          SELECT DISTINCT ACC.cust_id
          FROM Account ACC
          JOIN Transaction T ON ACC.acc_no = T.acc_no
          WHERE T.mode = 'Online'
      )
    `

    const [results] = await connection.execute(query)
    connection.release()
    res.json(results)
  } catch (error) {
    console.error("[v0] Query error:", error)
    res.status(500).json({ error: "Query execution failed" })
  }
})

router.get("/branches", async (req, res) => {
  try {
    const pool = getPool()
    const connection = await pool.getConnection()

    const query = `
      SELECT branch_id, name, location
      FROM Branch
      ORDER BY name ASC
    `

    const [results] = await connection.execute(query)
    connection.release()
    res.json(results)
  } catch (error) {
    console.error("[v0] Branches query error:", error)
    res.status(500).json({ error: "Failed to fetch branches" })
  }
})

export { router as queryRoutes }
