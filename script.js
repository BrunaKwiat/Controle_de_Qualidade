document.addEventListener('DOMContentLoaded', () => {
    const excelFileInput = document.getElementById('excelFile');
    const importButton = document.getElementById('importButton');
    const dataTableBody = document.querySelector('#dataTable tbody');
    const messageElement = document.getElementById('message');

    importButton.addEventListener('click', () => {
        const file = excelFileInput.files[0];

        if (!file) {
            displayMessage('Por favor, selecione um arquivo CSV.', 'error');
            return;
        }

        // Verifica se o arquivo é um CSV
        if (file.type !== 'text/xlsx' && !file.name.endsWith('.xlsx')) {
            displayMessage('Por favor, selecione um arquivo xlsx válido.', 'error');
            return;
        }

        const reader = new FileReader();

        reader.onload = function(e) {
            const text = e.target.result;
            processCSV(text);
        };

        reader.onerror = function() {
            displayMessage('Erro ao ler o arquivo.', 'error');
        };

        reader.readAsText(file);
    });

    function processCSV(xlsxText) {
        // Divide o texto CSV em linhas
        const lines = xlsxText.split('\n').filter(line => line.trim() !== '');

        if (lines.length === 0) {
            displayMessage('O arquivo CSV está vazio.', 'error');
            return;
        }

        // Limpa a tabela antes de adicionar novos dados
        dataTableBody.innerHTML = '';

        // Pula a primeira linha se for um cabeçalho (opcional, dependendo do seu CSV)
        // const headers = lines[0].split(';'); // Ou ',' se o delimitador for vírgula
        // const dataLines = lines.slice(1);

        // Para este exemplo, vamos assumir que não há cabeçalho ou que queremos todas as linhas
        // Se você tiver um cabeçalho e quiser pular, use: const dataLines = lines.slice(1);
        const dataLines = lines; // Se todas as linhas são dados

        dataLines.forEach(line => {
            // Ajuste o delimitador aqui (',' para CSV comum, ';' para CSV de Excel português)
            const columns = line.split(';'); // Ou line.split(',')

            // Verifica se há colunas suficientes
            if (columns.length >= 6) {
                const row = dataTableBody.insertRow();

                // Garante que os dados sejam exibidos corretamente
                const liberacao = columns[0].trim();
                const data = columns[1].trim();
                const empreiteira = columns[2].trim();
                const obra = columns[3].trim();
                const quantidade = columns[4].trim();
                const saldo = columns[5].trim();

                row.insertCell().textContent = liberacao;
                row.insertCell().textContent = dara;
                row.insertCell().textContent = empreiteira;
                row.insertCell().textContent = obra;
                row.insertCell().textContent = quantidade;
                row.insertCell().textContent = saldo;
            } else {
                console.warn('Linha ignorada por ter menos de 6 colunas:', line);
            }
        });

        if (dataTableBody.rows.length > 0) {
            displayMessage('Dados importados com sucesso!', 'success');
        } else {
            displayMessage('Nenhum dado válido encontrado no arquivo CSV.', 'error');
        }
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