// Authentication endpoints
import { Router, type Request, type Response } from "express"
import { validateDatabaseUser } from "../middleware/auth"

const router = Router()

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username) {
      return res.status(400).json({ error: "Username is required" })
    }

    const isValid = await validateDatabaseUser(username, password || "")

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const role = username === "root" ? "admin" : "customer"
    const token = Buffer.from(JSON.stringify({ username, role })).toString("base64")

    console.log("[v0] Login successful for user:", username, "role:", role)

    res.json({
      user: username,
      role: role,
      token: token,
      message: "Login successful",
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    res.status(500).json({ error: "Login failed" })
  }
})

router.post("/logout", (req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" })
})

export const authRoutes = router
