import xlsx from "xlsx"
import fs from "fs"

export async function parseExcel(path){

  const workbook = xlsx.readFile(path)

  const sheet = workbook.Sheets[workbook.SheetNames[0]]

  // 轉為陣列（不使用欄位名稱）
  const rows = xlsx.utils.sheet_to_json(sheet,{header:1})

  rows.shift() // 移除標題列

  const result = rows.map(r=>({

    plant: r[0] || "",       // 廠別
    dept: r[1] || "",        // 單位/部門
    name: r[2] || "",        // 姓名
    cert: r[3] || "",        // 證照名稱
    certNo: r[4] || "",      // 證號
    expiry: r[5] || ""       // 到期日

  }))

  fs.unlinkSync(path)

  return result
}
