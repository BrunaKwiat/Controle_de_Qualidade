document.addEventListener('DOMContentLoaded', () => {
    const excelFileInput = document.getElementById('excelFile');
    const importButton = document.getElementById('importButton');
    const dataTableBody = document.querySelector('#dataTable tbody');
    const messageElement = document.getElementById('message');

    importButton.addEventListener('click', () => {
        const file = excelFileInput.files[0];

        if (!file) {
            displayMessage('Por favor, selecione um arquivo Excel (.xlsx ou .xls).', 'error');
            return;
        }

        // Verifica se o arquivo é um XLSX ou XLS
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel' // .xls
        ];
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
            displayMessage('Por favor, selecione um arquivo Excel válido (.xlsx ou .xls).', 'error');
            return;
        }

        const reader = new FileReader();

        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Pega a primeira aba da planilha
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Converte a planilha para um array de objetos JSON
            // { header: 1 } para usar a primeira linha como cabeçalho (opcional, pode remover se não tiver cabeçalho)
            // raw: false para formatar células (datas, números) automaticamente
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

            processExcelData(json);
        };

        reader.onerror = function() {
            displayMessage('Erro ao ler o arquivo.', 'error');
        };

        reader.readAsArrayBuffer(file);
    });

    function processExcelData(data) {
        // Limpa a tabela antes de adicionar novos dados
        dataTableBody.innerHTML = '';

        if (data.length === 0) {
            displayMessage('A planilha Excel está vazia ou não contém dados válidos.', 'error');
            return;
        }

        // Assumimos que a primeira linha contém os cabeçalhos.
        // Se seus dados começam na primeira linha e não há cabeçalhos,
        // remova a linha abaixo e ajuste o índice das colunas.
        const headers = data[0]; // Primeira linha é o cabeçalho
        const actualData = data.slice(1); // O resto são os dados

        // Mapeia os cabeçalhos para os índices das colunas esperadas
        const colMap = {
            'Liberação': -1,
            'Data': -1,
            'Empreiteira': -1,
            'Obra': -1,
            'Quantidade': -1,
            'Saldo': -1
        };

        headers.forEach((header, index) => {
            const normalizedHeader = header ? header.trim() : '';
            switch (normalizedHeader) {
                case 'Liberação':
                    colMap['Liberação'] = index;
                    break;
                case 'Data':
                    colMap['Data'] = index;
                    break;
                case 'Empreiteira':
                    colMap['Empreiteira'] = index;
                    break;
                case 'Obpre': // Pode ser "Obra" ou "Obp" no Excel
                case 'Obra': // Adicione variações que seu Excel possa ter
                    colMap['Obra'] = index;
                    break;
                case 'Quantidade':
                    colMap['Quantidade'] = index;
                    break;
                case 'Saldo':
                    colMap['Saldo'] = index;
                    break;
                default:
                    // Ignora cabeçalhos não reconhecidos
                    break;
            }
        });

        let dataFound = false;
        actualData.forEach(rowArray => {
            // Garante que a linha tenha pelo menos o número de colunas que esperamos,
            // mesmo que algumas estejam vazias no final
            if (rowArray.length >= Math.max(...Object.values(colMap)) + 1) {
                const row = dataTableBody.insertRow();

                const liberacao = rowArray[colMap['Liberação']] !== undefined ? String(rowArray[colMap['Liberação']]).trim() : '';
                const dataValue = rowArray[colMap['Data']] !== undefined ? formatExcelDate(rowArray[colMap['Data']]) : '';
                const empreiteira = rowArray[colMap['Empreiteira']] !== undefined ? String(rowArray[colMap['Empreiteira']]).trim() : '';
                const obra = rowArray[colMap['Obra']] !== undefined ? String(rowArray[colMap['Obra']]).trim() : '';
                const quantidade = rowArray[colMap['Quantidade']] !== undefined ? String(rowArray[colMap['Quantidade']]).trim() : '';
                const saldo = rowArray[colMap['Saldo']] !== undefined ? String(rowArray[colMap['Saldo']]).trim() : '';

                row.insertCell().textContent = liberacao;
                row.insertCell().textContent = dataValue;
                row.insertCell().textContent = empreiteira;
                row.insertCell().textContent = obra;
                row.insertCell().textContent = quantidade;
                row.insertCell().textContent = saldo;
                dataFound = true;
            } else {
                console.warn('Linha ignorada por não ter colunas suficientes ou ser inválida:', rowArray);
            }
        });

        if (dataFound) {
            displayMessage('Dados importados com sucesso!', 'success');
        } else {
            displayMessage('Nenhum dado válido encontrado na planilha com os cabeçalhos esperados.', 'error');
        }
    }

    // Função para formatar datas do Excel (que podem vir como números)
    function formatExcelDate(excelDate) {
        if (typeof excelDate === 'number') {
            // O Excel armazena datas como números de dias desde 1900-01-01 (ou 1904 para Mac)
            // Convertendo para data JavaScript
            const date = XLSX.SSF.parse_date_code(excelDate);
            const jsDate = new Date(date.y, date.m - 1, date.d); // Mês é 0-indexado
            return jsDate.toLocaleDateString('pt-BR'); // Formata para o padrão brasileiro
        }
        return excelDate; // Retorna como está se não for um número
    }

    function displayMessage(message, type) {
        messageElement.textContent = message;
        messageElement.className = `message ${type}`; // Adiciona a classe para estilização
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'message';
        }, 5000); // Remove a mensagem após 5 segundos
    }
});