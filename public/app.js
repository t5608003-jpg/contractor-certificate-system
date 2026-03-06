async function upload() {

  const fileInput = document.getElementById("fileInput");

  if (!fileInput.files.length) {
    alert("請先選擇檔案");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  const res = await fetch("/upload", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  document.getElementById("status").innerText =
    "上傳成功，目前資料筆數：" + data.count;
}



async function search() {

  const keyword = document.getElementById("keyword").value;
  const expiry = document.getElementById("expiry").value;

  const res = await fetch(`/search?keyword=${keyword}&expiry=${expiry}`);
  const data = await res.json();

  const tbody = document.getElementById("result");
  tbody.innerHTML = "";

  data.forEach(row => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.unit}</td>
      <td>${row.name}</td>
      <td>${row.cert}</td>
      <td>${row.certNo}</td>
      <td>${row.expiry}</td>
    `;

    tbody.appendChild(tr);

  });

}
