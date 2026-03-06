import xlsx from "xlsx"
import fs from "fs"

export async function parseExcel(path) {

  const workbook = xlsx.readFile(path)

  const sheet = workbook.Sheets[workbook.SheetNames[0]]

  const data = xlsx.utils.sheet_to_json(sheet)

  fs.unlinkSync(path)

  return data
}
