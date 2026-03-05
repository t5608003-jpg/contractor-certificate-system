import express from "express"
import multer from "multer"
import cors from "cors"
import { parseExcel } from "./excelParser.js"

const app = express()
const port = process.env.PORT || 8080

app.use(cors())
app.use(express.json())
app.use(express.static("public"))

const upload = multer({ storage: multer.memoryStorage() })

let certificateData = []
let lastUploadTime = null

// 上傳 Excel / CSV
app.post("/upload", upload.single("file"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: "沒有檔案" })
  }

  certificateData = parseExcel(req.file.buffer)
  lastUploadTime = new Date()

  res.json({
    message: "上傳成功",
    count: certificateData.length
  })
})


// 查詢 API
app.get("/api/search", (req, res) => {

  const keyword = req.query.keyword || ""

  const result = certificateData.filter(r =>
    r.name.includes(keyword) ||
    r.certificate.includes(keyword) ||
    r.number.includes(keyword)
  )

  res.json(result)
})


// 取得上傳時間
app.get("/api/status", (req, res) => {

  res.json({
    count: certificateData.length,
    uploadTime: lastUploadTime
  })
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})