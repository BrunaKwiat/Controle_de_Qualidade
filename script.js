document.getElementById('formulario').addEventListener('submit', function(event) {
  event.preventDefault();

  const liberacao = document.getElementById('liberacao').value;
  const data = document.getElementById('data').value;
  const empreiteira = document.getElementById('empreiteira').value;
  const obra = document.getElementById('obra').value;
  const qtde = document.getElementById('qtde').value;
  const saldo = document.getElementById('saldo').value;

  const tabela = document.querySelector('#tabela tbody');
  const novaLinha = tabela.insertRow();

  novaLinha.innerHTML = `
    <td>${liberacao}</td>
    <td>${data}</td>
    <td>${empreiteira}</td>
    <td>${obra}</td>
    <td>${qtde}</td>
    <td>${saldo}</td>
  `;

  document.getElementById('formulario').reset();

  function importarExcel() {
  const input = document.getElementById('excelFile');
  const file = input.files[0];
  if (!file) {
    alert("Selecione um arquivo Excel.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    const tabela = document.querySelector('#tabela tbody');

    json.forEach(linha => {
      const novaLinha = tabela.insertRow();
      novaLinha.innerHTML = `
        <td>${linha.LIBERACAO || ''}</td>
        <td>${linha.DATA || ''}</td>
        <td>${linha.EMPREITEIRA || ''}</td>
        <td>${linha.OBRA || ''}</td>
        <td>${linha.QTDE || ''}</td>
        <td>${linha.SALDO || ''}</td>
      `;
    });
  };

  reader.readAsArrayBuffer(file);
}

});
