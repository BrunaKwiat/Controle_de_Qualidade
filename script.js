// Normaliza cabeçalhos: remove acentos, espaços, e converte para maiúsculas
function normalizarCabecalho(texto) {
  return texto
    .normalize("NFD")                      // separa letras de acentos
    .replace(/[\u0300-\u036f]/g, "")      // remove os acentos
    .replace(/[^a-zA-Z0-9]/g, "")         // remove caracteres especiais e espaços
    .toUpperCase();                       // para maiúsculo
}

// Mapeia colunas flexíveis para os campos esperados
function mapearCampos(obj) {
  const camposEsperados = {
    LIBERACAO: ["LIBERACAO", "LIBERAÇÃO"],
    DATA: ["DATA"],
    EMPREITEIRA: ["EMPREITEIRA", "EMPRESA"],
    OBRA: ["OBRA", "PROJETO"],
    QTDE: ["QTDE", "QUANTIDADE"],
    SALDO: ["SALDO", "RESTANTE"]
  };

  const novoObj = {};

  for (const campo in camposEsperados) {
    const alternativas = camposEsperados[campo];
    for (const chave in obj) {
      const chaveNormalizada = normalizarCabecalho(chave);
      if (alternativas.some(alt => normalizarCabecalho(alt) === chaveNormalizada)) {
        novoObj[campo] = obj[chave];
      }
    }
  }

  return novoObj;
}

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
    const jsonOriginal = XLSX.utils.sheet_to_json(sheet);

    const tabela = document.querySelector('#tabela tbody');

    jsonOriginal.forEach(linhaOriginal => {
      const linha = mapearCampos(linhaOriginal);
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
