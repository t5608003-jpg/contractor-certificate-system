async function search(){

    const keyword = document.getElementById("keyword").value
    const expiry = document.getElementById("expiry").value

    const res = await fetch(`/search?keyword=${keyword}&expiry=${expiry}`)

    const data = await res.json()

    const tbody = document.getElementById("result")

    tbody.innerHTML = ""

    data.forEach(r => {

        tbody.innerHTML += `
        <tr>
        <td>${r.unit}</td>
        <td>${r.name}</td>
        <td>${r.certificate}</td>
        <td>${r.number}</td>
        <td>${r.expiry}</td>
        </tr>
        `

    })

}
