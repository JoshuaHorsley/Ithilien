const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { toNodeHandler } = require('better-auth/node')
const { auth } = require('./lib/auth')



dotenv.config()

const app = express()
const PORT = process.env.PORT || 3003

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())

app.all('/api/auth/{*splat}', toNodeHandler(auth))

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})