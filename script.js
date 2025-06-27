// script.js

document.addEventListener('DOMContentLoaded', () => {
    const inputExcel = document.getElementById('inputExcel');
    const materialForm = document.getElementById('materialForm');
    const dataTableBody = document.querySelector('#dataTable tbody');
    const emptyTableMessage = document.getElementById('emptyTableMessage');

    // Função para adicionar uma nova linha à tabela
    function addRowToTable(data) {
        const row = document.createElement('tr');

        // Garante que os dados estão na ordem correta dos cabeçalhos da tabela
        const orderedKeys = ['LIBERAÇÃO', 'DATA', 'EMPREITEIRA', 'OBRA', 'QTDE', 'SALDO'];
        
        orderedKeys.forEach(key => {
            const td = document.createElement('td');
            let value = data[key] !== undefined ? data[key] : '';

            // Formatação especial para a data, se for o caso (ex: vinda do Excel como número)
            if (key === 'DATA' && typeof value === 'number' && value > 1) { // XLSX armazena datas como números (dias desde 1900-01-01)
                // Converte número de data do Excel para objeto Date
                const excelDate = new Date((value - (25567 + 1)) * 86400 * 1000); // 25567 é a diferença de dias entre 1900-01-01 e 1970-01-01, +1 para ajuste
                value = excelDate.toLocaleDateString('pt-BR'); // Formata para DD/MM/AAAA
            } else if (key === 'DATA' && value instanceof Date) {
                value = value.toLocaleDateString('pt-BR');
            } else if (key === 'DATA' && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // Se a data vier no formato 'YYYY-MM-DD' (do input type="date"), formata
                const dateParts = value.split('-');
                value = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            }

            td.textContent = value;
            row.appendChild(td);
        });
        dataTableBody.appendChild(row);
        checkTableContent(); // Verifica se a mensagem de vazio deve ser mostrada
    }

    // Função para limpar e preencher a tabela a partir de um array de objetos (ou array de arrays)
    function renderTableFromData(jsonData) {
        dataTableBody.innerHTML = ''; // Limpa a tabela existente

        if (jsonData.length === 0) {
            checkTableContent();
            return;
        }

        // Se a primeira linha são os cabeçalhos e as demais são dados (vindo do Excel)
        // A biblioteca XLSX.utils.sheet_to_json(worksheet, { header: 1 }) retorna array de arrays
        // A biblioteca XLSX.utils.sheet_to_json(worksheet) retorna array de objetos com chaves pelos nomes dos headers
        
        // Vamos padronizar para usar objetos com chaves para facilitar a inserção
        let dataToRender;
        if (Array.isArray(jsonData[0])) { // Se for array de arrays (resultado de {header:1})
            const headers = jsonData[0];
            dataToRender = jsonData.slice(1).map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index];
                });
                return obj;
            });
        } else { // Se já for array de objetos (resultado padrão)
            dataToRender = jsonData;
        }

        dataToRender.forEach(item => addRowToTable(item));
    }

    // Lógica para importar Excel
    inputExcel.addEventListener('change', (e) => {
        const file = e.target.files[0];

        if (!file) {
            dataTableBody.innerHTML = ''; // Limpa a tabela se nenhum arquivo for selecionado
            checkTableContent();
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                const sheetName = workbook.SheetNames[0]; // Pega a primeira aba
                const worksheet = workbook.Sheets[sheetName];
                
                // Converte a planilha para um array de objetos, onde as chaves são os cabeçalhos das colunas
                const jsonData = XLSX.utils.sheet_to_json(worksheet); 
                
                renderTableFromData(jsonData);

            } catch (error) {
                console.error("Erro ao ler o arquivo Excel:", error);
                dataTableBody.innerHTML = `<tr><td colspan="6" style="color: red; text-align: center;">Ocorreu um erro ao processar o arquivo Excel. Verifique se é um arquivo válido e tente novamente.</td></tr>`;
                emptyTableMessage.style.display = 'none'; // Esconde a mensagem de vazio
            }
        };

        reader.onerror = (error) => {
            console.error("Erro ao carregar o arquivo:", error);
            dataTableBody.innerHTML = `<tr><td colspan="6" style="color: red; text-align: center;">Não foi possível ler o arquivo. Tente novamente.</td></tr>`;
            emptyTableMessage.style.display = 'none'; // Esconde a mensagem de vazio
        };

        reader.readAsArrayBuffer(file);
    });

    // Lógica para adicionar dados do formulário à tabela
    materialForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o envio padrão do formulário

        const formData = new FormData(materialForm);
        const newData = {};
        for (let [key, value] of formData.entries()) {
            // Converte os nomes dos campos para maiúsculas para corresponder aos cabeçalhos da tabela
            newData[key.toUpperCase()] = value;
        }

        addRowToTable(newData);
        materialForm.reset(); // Limpa o formulário após adicionar
    });

    // Função para verificar e exibir/esconder a mensagem de "tabela vazia"
    function checkTableContent() {
        if (dataTableBody.children.length > 0) {
            emptyTableMessage.style.display = 'none';
        } else {
            emptyTableMessage.style.display = 'block';
        }
    }

    // Chamada inicial para garantir que a mensagem de vazio apareça se a tabela estiver inicialmente vazia
    checkTableContent();
});