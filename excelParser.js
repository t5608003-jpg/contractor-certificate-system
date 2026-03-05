import xlsx from "xlsx"

export function parseExcel(buffer) {

  const workbook = xlsx.read(buffer, { type: "buffer" })

  const sheet = workbook.Sheets[workbook.SheetNames[0]]

  const data = xlsx.utils.sheet_to_json(sheet)

  return data.map(row => ({

    name: row["姓名"] || "",
    certificate: row["證照名稱"] || "",
    number: row["合格證字號"] || "",
    expire: row["到期日"] || "",
    course: row["預定課程日期及地點"] || ""

  }))
}