async function search(){

const keyword = document.getElementById("keyword").value

const res = await fetch(`/api/search?keyword=${keyword}`)

const data = await res.json()

const tbody = document.getElementById("result")

tbody.innerHTML=""

data.forEach(r=>{

const tr=document.createElement("tr")

tr.innerHTML=`
<td>${r.name}</td>
<td>${r.certificate}</td>
<td>${r.number}</td>
<td>${r.expire}</td>
<td>${r.course}</td>
`

tbody.appendChild(tr)

})

}

async function upload(){

const file=document.getElementById("file").files[0]

const form=new FormData()

form.append("file",file)

await fetch("/upload",{
method:"POST",
body:form
})

alert("上傳完成")

loadStatus()

}

async function loadStatus(){

const res=await fetch("/api/status")

const data=await res.json()

document.getElementById("status").innerText=
`目前資料筆數：${data.count}`

}

loadStatus()