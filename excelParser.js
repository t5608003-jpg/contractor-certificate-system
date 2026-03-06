const XLSX = require("xlsx")

function parseExcel(buffer){

    const workbook = XLSX.read(buffer,{type:"buffer"})

    const sheet = workbook.Sheets[workbook.SheetNames[0]]

    const rows = XLSX.utils.sheet_to_json(sheet)

    return rows.map(r=>({

        unit: r["單位"] || r["廠別"] || "",
        name: r["姓名"] || "",
        cert: r["證照名稱"] || r["證照"] || "",
        certNo: r["證號"] || r["證照號碼"] || "",
        expiry: r["到期日"] || r["有效期限"] || ""

    }))

}

module.exports = parseExcel
