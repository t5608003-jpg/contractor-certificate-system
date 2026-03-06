import express from "express"
import multer from "multer"
import cors from "cors"
import { parseExcel } from "./excelParser.js"

const app = express()
const upload = multer({ dest: "uploads/" })

app.use(cors())
app.use(express.json())
app.use(express.static("public"))

let database = []

function parseDate(str) {

  if (!str) return null

  if (str.includes("年")) {

    let m = str.match(/(\d+)年(\d+)月(\d+)/)
    if (!m) return null

    let y = parseInt(m[1]) + 1911
    let mo = parseInt(m[2]) - 1
    let d = parseInt(m[3])

    return new Date(y, mo, d)
  }

  return new Date(str)
}

function getStatus(expiry) {

  let d = parseDate(expiry)
  if (!d) return "合格"

  let now = new Date()
  let diff = (d - now) / (1000 * 60 * 60 * 24)

  if (diff < 0) return "已過期"
  if (diff <= 90) return "待規劃"

  return "合格"
}

app.post("/upload", upload.single("file"), async (req, res) => {

  try {

    const rows = await parseExcel(req.file.path)

    database = rows.map(r => ({

      plant: r["廠別"] || "",
      dept: r["單位"] || r["部門"] || "",
      name: r["姓名"] || "",
      cert: r["證照名稱"] || "",
      certNo: r["合格證字號"] || "",
      expiry: r["到期日"] || "",
      courseDate: "",
      coursePlace: ""

    }))

    res.json({
      success: true,
      count: database.length
    })

  } catch (err) {

    res.status(500).json({ error: err.message })

  }

})

app.get("/search", (req, res) => {

  let { keyword, expiry } = req.query

  let result = database

  if (keyword) {

    keyword = keyword.toLowerCase()

    result = result.filter(r =>
      r.plant.toLowerCase().includes(keyword) ||
      r.dept.toLowerCase().includes(keyword) ||
      r.name.toLowerCase().includes(keyword) ||
      r.cert.toLowerCase().includes(keyword)
    )

  }

  if (expiry) {

    let now = new Date()

    result = result.filter(r => {

      let d = parseDate(r.expiry)
      if (!d) return false

      let diff = (d - now) / (1000 * 60 * 60 * 24)

      if (expiry === "expired") return diff < 0
      if (expiry === "month") return diff <= 30 && diff >= 0
      if (expiry === "1") return diff <= 30
      if (expiry === "2") return diff <= 60
      if (expiry === "3") return diff <= 90

      return true

    })

  }

  result = result.map((r, i) => ({
    ...r,
    status: getStatus(r.expiry),
    id: i
  }))

  res.json(result)

})

app.post("/course", (req, res) => {

  const { id, date, place } = req.body

  if (database[id]) {

    database[id].courseDate = date
    database[id].coursePlace = place

  }

  res.json({ success: true })

})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log("Server running on port", PORT)
})
