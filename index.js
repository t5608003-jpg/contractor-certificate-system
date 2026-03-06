const express = require("express")
const multer = require("multer")
const XLSX = require("xlsx")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

const upload = multer({ storage: multer.memoryStorage() })

let database = []

/* =========================
   Excel / CSV 上傳
========================= */

app.post("/upload", upload.single("file"), (req, res) => {

    if (!req.file) {
        return res.json({ count: 0 })
    }

    try {

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" })

        const sheet = workbook.Sheets[workbook.SheetNames[0]]

        const rows = XLSX.utils.sheet_to_json(sheet)

        database = rows.map(r => ({

            unit: r["單位"] || r["廠別"] || "",
            name: r["姓名"] || "",
            cert: r["證照名稱"] || r["證照"] || "",
            certNo: r["證號"] || r["證照號碼"] || "",
            expiry: formatDate(r["到期日"] || r["有效期限"] || "")

        }))

        res.json({
            success: true,
            count: database.length
        })

    } catch (err) {

        console.error(err)

        res.json({
            success: false,
            error: "Excel解析失敗"
        })

    }

})


/* =========================
   查詢 API
========================= */

app.get("/search", (req, res) => {

    const keyword = (req.query.keyword || "").toLowerCase()
    const expiry = req.query.expiry || ""

    let result = database.filter(r =>

        r.unit.toLowerCase().includes(keyword) ||
        r.name.toLowerCase().includes(keyword) ||
        r.cert.toLowerCase().includes(keyword)

    )

    if (expiry) {

        const now = new Date()

        result = result.filter(r => {

            if (!r.expiry) return false

            const d = new Date(r.expiry)

            if (expiry === "expired") return d < now

            if (expiry === "month")
                return d.getMonth() === now.getMonth() &&
                       d.getFullYear() === now.getFullYear()

            const future = new Date()
            future.setMonth(future.getMonth() + Number(expiry))

            return d <= future

        })

    }

    res.json(result)

})


/* =========================
   日期格式轉換
========================= */

function formatDate(v){

    if(!v) return ""

    if(typeof v === "number"){

        const date = XLSX.SSF.parse_date_code(v)

        return `${date.y}-${date.m}-${date.d}`
    }

    return v
}


/* =========================
   Server
========================= */

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {

    console.log("Server running on", PORT)

})
