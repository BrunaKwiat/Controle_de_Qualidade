// script.js

document.addEventListener('DOMContentLoaded', () => {
    const inputExcel = document.getElementById('inputExcel');
    const excelTable = document.getElementById('excelTable');

    inputExcel.addEventListener('change', (e) => {
        const file = e.target.files[0];

        if (!file) {
            excelTable.innerHTML = ""; // Limpa a tabela se nenhum arquivo for selecionado
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Pega o nome da primeira aba da planilha
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                // Converte a planilha para um array de arrays (linha a linha)
                // { header: 1 } faz com que a primeira linha seja tratada como cabeçalho
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                renderTable(jsonData);

            } catch (error) {
                console.error("Erro ao ler o arquivo Excel:", error);
                excelTable.innerHTML = `<p style="color: red; text-align: center;">Ocorreu um erro ao processar o arquivo Excel. Verifique se é um arquivo válido e tente novamente.</p>`;
            }
        };

        reader.onerror = (error) => {
            console.error("Erro ao carregar o arquivo:", error);
            excelTable.innerHTML = `<p style="color: red; text-align: center;">Não foi possível ler o arquivo. Tente novamente.</p>`;
        };

        reader.readAsArrayBuffer(file);
    });

    /**
     * Renderiza os dados da planilha na tabela HTML.
     * @param {Array<Array<any>>} data Array de arrays contendo os dados da planilha.
     */
    function renderTable(data) {
        excelTable.innerHTML = ""; // Limpa a tabela antes de renderizar novos dados

        if (data.length === 0) {
            excelTable.innerHTML = `<p style="text-align: center;">A planilha está vazia ou não contém dados válidos.</p>`;
            return;
        }

        // Monta o cabeçalho
        const headerRow = document.createElement("tr");
        data[0].forEach(cellText => {
            const th = document.createElement("th");
            th.textContent = cellText;
            headerRow.appendChild(th);
        });
        excelTable.appendChild(headerRow);

        // Monta os dados (começando da segunda linha do jsonData, pois a primeira é o cabeçalho)
        for (let i = 1; i < data.length; i++) {
            const rowData = data[i];
            const tr = document.createElement("tr");
            rowData.forEach(cellText => {
                const td = document.createElement("td");
                td.textContent = cellText === undefined ? '' : cellText; // Trata células vazias
                tr.appendChild(td);
            });
            excelTable.appendChild(tr);
        }
    }
});