import express from "express"
import multer from "multer"
import cors from "cors"
import { parseExcel } from "./excelParser.js"

const app = express()
const upload = multer({ dest: "uploads/" })

app.use(cors())
app.use(express.json())

// 讀取 public 資料夾
app.use(express.static("public"))

let database = []

// 上傳 Excel / CSV
app.post("/upload", upload.single("file"), async (req, res) => {

    try {

        const rows = await parseExcel(req.file.path)

        database = rows

        res.json({
            success: true,
            count: database.length
        })

    } catch (err) {

        console.error(err)

        res.status(500).json({
            success: false
        })
    }

})


// 取得現在年月
function getMonthDiff(date1, date2){

    const y1 = date1.getFullYear()
    const m1 = date1.getMonth()

    const y2 = date2.getFullYear()
    const m2 = date2.getMonth()

    return (y2 - y1) * 12 + (m2 - m1)

}


// 查詢 API
app.get("/search", (req, res) => {

    const keyword = req.query.keyword || ""
    const expiry = req.query.expiry || ""

    let result = database

    // 關鍵字查詢
    if(keyword){

        result = result.filter(r =>

            (r.unit || "").includes(keyword) ||
            (r.name || "").includes(keyword) ||
            (r.certificate || "").includes(keyword) ||
            (r.number || "").includes(keyword)

        )

    }

    // 到期篩選
    if(expiry){

        const now = new Date()

        result = result.filter(r => {

            if(!r.expiryDate) return false

            const diff = getMonthDiff(now, r.expiryDate)

            if(expiry === "expired") return diff < 0
            if(expiry === "0") return diff === 0
            if(expiry === "1") return diff === 1
            if(expiry === "2") return diff === 2
            if(expiry === "3") return diff === 3

            return true
        })

    }

    res.json(result)

})


// 取得資料筆數
app.get("/count", (req,res)=>{

    res.json({
        count: database.length
    })

})


// Server start
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`)

})
