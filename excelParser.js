import xlsx from "xlsx"

export function parseExcel(buffer) {

    const workbook = xlsx.read(buffer)

    const sheet = workbook.Sheets[workbook.SheetNames[0]]

    const data = xlsx.utils.sheet_to_json(sheet)

    return data.map(r => ({

        unit: r["單位"] || "",
        name: r["姓名"] || "",
        certificate: r["證照名稱"] || "",
        number: r["合格證字號"] || "",
        expiry: r["到期日"] || ""

    }))

}
