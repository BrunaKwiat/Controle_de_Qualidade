// Função para normalizar nomes das colunas (ex: "Liberação " -> "liberacao")
function normalizeHeader(header) {
  return header.toLowerCase().trim().replace(/\s+/g, '');
}

// Mapeamento das colunas esperadas (chaves normalizadas)
const expectedHeaders = {
  liberacao: null,
  data: null,
  empreiteira: null,
  obra: null,
  qtde: null,
  saldo: null
};

function processExcelData(data) {
  // 'data' é a array com objetos (cada linha do Excel)

  if (data.length === 0) {
    alert("Planilha vazia.");
    return;
  }

  // Descobrir quais colunas correspondem a cada campo esperado
  const firstRow = data[0];
  const headers = Object.keys(firstRow);

  // Criar um mapa: nome esperado -> nome real da coluna no Excel
  const headerMap = {};

  headers.forEach(h => {
    const norm = normalizeHeader(h);
    for (let key in expectedHeaders) {
      if (norm === key) {
        headerMap[key] = h;
      }
    }
  });

  // Checar se todas as colunas essenciais foram encontradas
  for (let key in expectedHeaders) {
    if (!headerMap[key]) {
      console.warn(`A coluna para "${key}" não foi encontrada.`);
      // Pode decidir se quer alertar ou não
    }
  }

  // Agora, gerar a tabela usando as colunas encontradas
  const tbody = document.querySelector("#table-body");
  tbody.innerHTML = ""; // limpa a tabela

  data.forEach(row => {
    const tr = document.createElement("tr");

    for (let key of Object.keys(expectedHeaders)) {
      const colName = headerMap[key];
      const td = document.createElement("td");
      td.textContent = colName && row[colName] !== undefined ? row[colName] : "";
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  });
}
