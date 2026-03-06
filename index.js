const express = require("express")
const multer = require("multer")
const XLSX = require("xlsx")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json())

app.use(express.static(path.join(__dirname, "public")))

const upload = multer({ storage: multer.memoryStorage() })

let database = []

/* 日期轉換 */
function parseDate(value) {

  if (!value) return null

  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value)
    return new Date(date.y, date.m - 1, date.d)
  }

  let str = value.toString().trim()

  str = str.replace(/[年月]/g, "/").replace(/日/g, "")

  let parts = str.split("/")

  if (parts.length >= 3) {

    let y = parseInt(parts[0])

    if (y < 1911) {
      y = y + 1911
    }

    let m = parseInt(parts[1]) - 1
    let d = parseInt(parts[2])

    return new Date(y, m, d)
  }

  return null
}

/* 到期篩選 */
function filterExpiry(data, type) {

  if (!type) return data

  const today = new Date()

  const startMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const m1 = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const m2 = new Date(today.getFullYear(), today.getMonth() + 2, 0)

  const m3 = new Date(today.getFullYear(), today.getMonth() + 3, 0)

  return data.filter(row => {

    const exp = parseDate(row.expiry)

    if (!exp) return false

    if (type === "expired") {
      return exp < today
    }

    if (type === "month") {
      return exp >= startMonth && exp <= endMonth
    }

    if (type === "1") {
      return exp > endMonth && exp <= m1
    }

    if (type === "2") {
      return exp > m1 && exp <= m2
    }

    if (type === "3") {
      return exp > m2 && exp <= m3
    }

    return true
  })
}

/* 上傳 Excel */
app.post("/upload", upload.single("file"), (req, res) => {

  try {

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" })

    const sheet = workbook.Sheets[workbook.SheetNames[0]]

    const rows = XLSX.utils.sheet_to_json(sheet)

    database = rows.map(r => ({
      unit: r["單位"] || r["廠別"] || "",
      name: r["姓名"] || "",
      cert: r["證照名稱"] || r["證照"] || "",
      certNo: r["證號"] || r["合格證字號"] || "",
      expiry: r["到期日"] || r["有效期限"] || ""
    }))

    res.json({
      success: true,
      count: database.length
    })

  } catch (err) {

    console.error(err)

    res.status(500).json({
      success: false,
      error: "解析檔案失敗"
    })

  }

})

/* 查詢 */
app.get("/search", (req, res) => {

  let { keyword, expiry } = req.query

  let result = database

  if (keyword) {

    keyword = keyword.toLowerCase()

    result = result.filter(r =>
      (r.unit && r.unit.toLowerCase().includes(keyword)) ||
      (r.name && r.name.toLowerCase().includes(keyword)) ||
      (r.cert && r.cert.toLowerCase().includes(keyword)) ||
      (r.certNo && r.certNo.toLowerCase().includes(keyword))
    )

  }

  result = filterExpiry(result, expiry)

  res.json(result)

})

app.listen(PORT, () => {
  console.log("Server running on port", PORT)
})
