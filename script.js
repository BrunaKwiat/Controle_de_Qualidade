// Cadastro de Qualidade
const qualityForm = document.getElementById("qualityForm");
const qualityTable = document.getElementById("qualityTable").querySelector("tbody");

qualityForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const liberacao = document.getElementById("liberacao").value;
  const data = document.getElementById("data").value;
  const empreiteira = document.getElementById("empreiteira").value;
  const obra = document.getElementById("obra").value;
  const qtde = document.getElementById("qtde").value;
  const saldo = document.getElementById("saldo").value;

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${liberacao}</td>
    <td>${data}</td>
    <td>${empreiteira}</td>
    <td>${obra}</td>
    <td>${qtde}</td>
    <td>${saldo}</td>
    <td><button onclick="deleteRow(this)">Excluir</button></td>
  `;
  qualityTable.appendChild(row);
  qualityForm.reset();
});

function deleteRow(button) {
  const row = button.closest("tr");
  row.remove();
}

// Filtros
const applyFiltersBtn = document.getElementById("applyFilters");
const clearFiltersBtn = document.getElementById("clearFilters");

applyFiltersBtn.addEventListener("click", () => {
  const filterLiberacao = document.getElementById("filterLiberacao").value.toLowerCase();
  const filterData = document.getElementById("filterData").value;
  const filterEmpreiteira = document.getElementById("filterEmpreiteira").value.toLowerCase();
  const filterObra = document.getElementById("filterObra").value.toLowerCase();

  Array.from(qualityTable.rows).forEach(row => {
    const [lib, data, emp, obr] = [0, 1, 2, 3].map(i => row.cells[i].textContent.toLowerCase());
    const match = (!filterLiberacao || lib.includes(filterLiberacao)) &&
                  (!filterData || row.cells[1].textContent === filterData) &&
                  (!filterEmpreiteira || emp.includes(filterEmpreiteira)) &&
                  (!filterObra || obr.includes(filterObra));
    row.style.display = match ? "" : "none";
  });
});

clearFiltersBtn.addEventListener("click", () => {
  document.getElementById("filterLiberacao").value = "";
  document.getElementById("filterData").value = "";
  document.getElementById("filterEmpreiteira").value = "";
  document.getElementById("filterObra").value = "";
  applyFiltersBtn.click();
});

// Importar Excel
const importExcelBtn = document.getElementById("importExcel");
const excelFileInput = document.getElementById("excelFileInput");

importExcelBtn.addEventListener("click", () => {
  const file = excelFileInput.files[0];
  if (!file) return alert("Selecione um arquivo Excel.");

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    json.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.LIBERACAO || ""}</td>
        <td>${item.DATA || ""}</td>
        <td>${item.EMPREITEIRA || ""}</td>
        <td>${item.OBRA || ""}</td>
        <td>${item.QTDE || 0}</td>
        <td>${item.SALDO || 0}</td>
        <td><button onclick="deleteRow(this)">Excluir</button></td>
      `;
      qualityTable.appendChild(row);
    });
  };
  reader.readAsArrayBuffer(file);
});

// Gerar PDF
const generatePdfBtn = document.getElementById("generatePdf");

generatePdfBtn.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let data = [["Liberação", "Data", "Empreiteira", "Obra", "Qtde", "Saldo"]];
  Array.from(qualityTable.rows).forEach(row => {
    const rowData = Array.from(row.cells).slice(0, 6).map(cell => cell.textContent);
    data.push(rowData);
  });

  doc.autoTable({ head: [data[0]], body: data.slice(1) });
  doc.save("relatorio.pdf");
});

// Controle de Estoque
const estoqueAtual = document.getElementById("estoqueAtual");
const clienteForm = document.getElementById("clienteForm");
const clienteTable = document.getElementById("clienteTable").querySelector("tbody");

clienteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = document.getElementById("clienteNome").value;
  const item = document.getElementById("itemComprado").value;
  const qtde = parseInt(document.getElementById("qtdeComprada").value);
  const tipo = document.getElementById("tipoAlteracaoEstoque").value;

  let estoque = parseInt(estoqueAtual.value);
  estoque = tipo === "saida" ? estoque - qtde : estoque + qtde;
  estoqueAtual.value = estoque;

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${nome}</td>
    <td>${item}</td>
    <td>${qtde}</td>
    <td>${tipo}</td>
  `;
  clienteTable.appendChild(row);
  clienteForm.reset();
});
