document.getElementById('excelFile').addEventListener('change', handleFile);

function handleFile(e) {
    const file = e.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Supondo que você queira a primeira planilha
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Converte a planilha para um array de arrays (linhas e colunas)
        const jsonSheet = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        renderTable(jsonSheet);
    };

    reader.readAsArrayBuffer(file);
}

function renderTable(data) {
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = ''; // Limpa o conteúdo anterior

    if (data.length === 0) {
        tableContainer.innerHTML = '<p>Nenhum dado encontrado na planilha.</p>';
        return;
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Cria o cabeçalho da tabela (primeira linha do Excel)
    const headerRow = document.createElement('tr');
    data[0].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Adiciona as linhas de dados
    for (let i = 1; i < data.length; i++) {
        const rowData = data[i];
        const tr = document.createElement('tr');
        rowData.forEach(cellData => {
            const td = document.createElement('td');
            td.textContent = cellData;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}