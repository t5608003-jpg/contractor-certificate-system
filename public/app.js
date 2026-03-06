async function upload(){

  const file = document.getElementById("file").files[0]

  const form = new FormData()
  form.append("file", file)

  const res = await fetch("/upload",{
    method:"POST",
    body:form
  })

  const data = await res.json()

  document.getElementById("msg").innerText =
    "上傳成功，目前資料筆數："+data.count
}

async function search(){

  const keyword = document.getElementById("keyword").value
  const expiry = document.getElementById("expiry").value

  const res = await fetch(`/search?keyword=${keyword}&expiry=${expiry}`)
  const data = await res.json()

  const tbody = document.getElementById("result")
  tbody.innerHTML=""

  data.forEach(r=>{

    let color="green"
    if(r.status==="已過期") color="red"
    if(r.status==="待規劃") color="red"

    let btn=""

    if(r.status!=="合格"){

      btn=`<button onclick="setCourse(${r.id})">安排課程</button>`

    }

    tbody.innerHTML+=`

<tr>

<td>${r.plant}</td>
<td>${r.dept}</td>
<td>${r.name}</td>
<td>${r.cert}</td>
<td>${r.certNo}</td>
<td>${r.expiry}</td>

<td style="color:${color}">
${r.status}
${btn}
</td>

</tr>

`
  })

}

async function setCourse(id){

  const date = prompt("輸入課程日期")
  const place = prompt("輸入課程地點")

  await fetch("/course",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({id,date,place})
  })

  alert("已儲存")
}
