document.addEventListener('DOMContentLoaded', () => {
    // --- Variáveis Globais e Inicialização ---
    const qualityForm = document.getElementById('qualityForm');
    const qualityTableBody = document.querySelector('#qualityTable tbody');
    const estoqueAtualInput = document.getElementById('estoqueAtual');
    const clienteForm = document.getElementById('clienteForm');
    const clienteTableBody = document.querySelector('#clienteTable tbody');

    // Filtros
    const filterLiberacao = document.getElementById('filterLiberacao');
    const filterData = document.getElementById('filterData');
    const filterEmpreiteira = document.getElementById('filterEmpreiteira');
    const filterObra = document.getElementById('filterObra');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const clearFiltersBtn = document.getElementById('clearFilters');

    // Botões de Ação
    const excelFileInput = document.getElementById('excelFileInput');
    const importExcelBtn = document.getElementById('importExcel');
    const generatePdfBtn = document.getElementById('generatePdf');

    let qualityRecords = JSON.parse(localStorage.getItem('qualityRecords')) || [];
    // Removi a inicialização de currentFilteredRecords aqui, ela será definida por renderQualityRecords
    let estoqueAtual = parseInt(localStorage.getItem('estoqueAtual')) || 100; // Estoque inicial
    let clienteRecords = JSON.parse(localStorage.getItem('clienteRecords')) || [];

    // Esta variável armazenará os registros que estão atualmente sendo exibidos/filtrados na tabela.
    // Ela será a fonte para a exportação de PDF.
    let currentDisplayedRecords = [];

    estoqueAtualInput.value = estoqueAtual;

    // --- Funções Auxiliares ---

    // Salva os registros no localStorage
    function saveRecords() {
        localStorage.setItem('qualityRecords', JSON.stringify(qualityRecords));
        localStorage.setItem('estoqueAtual', estoqueAtual);
        localStorage.setItem('clienteRecords', JSON.stringify(clienteRecords));
    }

    // Renderiza os registros de qualidade na tabela
    function renderQualityRecords(recordsToDisplay = qualityRecords) {
        qualityTableBody.innerHTML = ''; // Limpa a tabela

        // Atualiza a variável global com os registros que estão sendo renderizados
        currentDisplayedRecords = [...recordsToDisplay]; // Cria uma cópia para evitar referência direta

        if (recordsToDisplay.length === 0) {
            const noDataRow = qualityTableBody.insertRow();
            const cell = noDataRow.insertCell(0);
            cell.colSpan = 7;
            cell.textContent = "Nenhum registro encontrado.";
            cell.style.textAlign = "center";
            cell.style.padding = "20px";
            return;
        }

        recordsToDisplay.forEach((record, index) => {
            const row = qualityTableBody.insertRow();
            // Para editar/excluir, precisamos do índice no array original 'qualityRecords'
            // O ideal é usar um identificador único (ID) se houver, mas para este exemplo,
            // vamos encontrar o índice original.
            const originalIndex = qualityRecords.findIndex(r =>
                r.liberacao === record.liberacao &&
                r.data === record.data &&
                r.empreiteira === record.empreiteira &&
                r.obra === record.obra &&
                r.qtde === record.qtde &&
                r.saldo === record.saldo
            );

            row.insertCell().textContent = record.liberacao;
            row.insertCell().textContent = record.data;
            row.insertCell().textContent = record.empreiteira;
            row.insertCell().textContent = record.obra;
            row.insertCell().textContent = record.qtde;
            row.insertCell().textContent = record.saldo;

            const actionsCell = row.insertCell();
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.classList.add('edit-btn');
            editButton.onclick = () => editQualityRecord(originalIndex); // Passa o índice original
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.classList.add('delete-btn');
            deleteButton.onclick = () => deleteQualityRecord(originalIndex); // Passa o índice original
            actionsCell.appendChild(deleteButton);
        });
    }

    // Renderiza os registros de cliente na tabela
    function renderClienteRecords() {
        clienteTableBody.innerHTML = '';
        clienteRecords.forEach(record => {
            const row = clienteTableBody.insertRow();
            row.insertCell().textContent = record.clienteNome;
            row.insertCell().textContent = record.itemComprado;
            row.insertCell().textContent = record.qtdeComprada;
            row.insertCell().textContent = record.tipoAlteracaoEstoque === 'saida' ? 'Saída' : 'Entrada';
        });
    }

    // --- Funcionalidades de Cadastro e Edição ---

    // Adiciona ou edita um registro de qualidade
    qualityForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const newRecord = {
            liberacao: document.getElementById('liberacao').value,
            data: document.getElementById('data').value,
            empreiteira: document.getElementById('empreiteira').value,
            obra: document.getElementById('obra').value,
            qtde: parseInt(document.getElementById('qtde').value),
            saldo: parseInt(document.getElementById('saldo').value)
        };

        const editingIndex = qualityForm.dataset.editingIndex;
        if (editingIndex !== undefined && editingIndex !== "") { // Verifica se o índice existe e não é vazio
            // Se estiver editando, atualiza o registro existente no array original
            qualityRecords[parseInt(editingIndex)] = newRecord;
            delete qualityForm.dataset.editingIndex; // Remove o índice de edição
            qualityForm.querySelector('button[type="submit"]').textContent = 'Adicionar Registro'; // Volta ao texto original
        } else {
            // Senão, adiciona um novo registro
            qualityRecords.push(newRecord);
        }

        saveRecords();
        applyFilters(); // Re-aplica os filtros para garantir que a tabela e currentDisplayedRecords estejam atualizados
        qualityForm.reset();
    });

    // Edita um registro de qualidade
    function editQualityRecord(index) {
        // Preenche o formulário com os dados do registro selecionado do array original
        const recordToEdit = qualityRecords[index];
        if (!recordToEdit) return; // Garante que o registro existe

        document.getElementById('liberacao').value = recordToEdit.liberacao;
        document.getElementById('data').value = recordToEdit.data;
        document.getElementById('empreiteira').value = recordToEdit.empreiteira;
        document.getElementById('obra').value = recordToEdit.obra;
        document.getElementById('qtde').value = recordToEdit.qtde;
        document.getElementById('saldo').value = recordToEdit.saldo;

        // Armazena o índice do registro que está sendo editado no dataset do formulário
        qualityForm.dataset.editingIndex = index.toString(); // Salva como string
        // Muda o texto do botão para indicar que está em modo de edição
        qualityForm.querySelector('button[type="submit"]').textContent = 'Atualizar Registro';
    }

    // Exclui um registro de qualidade
    function deleteQualityRecord(index) {
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            // Remove o registro do array original
            qualityRecords.splice(index, 1);
            saveRecords();
            applyFilters(); // Re-aplica os filtros para atualizar a tabela e currentDisplayedRecords
        }
    }

    // --- Funcionalidades de Filtro ---

    // Aplica os filtros
    function applyFilters() {
        const liberacao = filterLiberacao.value.toLowerCase();
        const data = filterData.value;
        const empreiteira = filterEmpreiteira.value.toLowerCase();
        const obra = filterObra.value.toLowerCase();

        const filtered = qualityRecords.filter(record => {
            const matchLiberacao = liberacao ? record.liberacao.toLowerCase().includes(liberacao) : true;
            const matchData = data ? record.data === data : true;
            const matchEmpreiteira = empreiteira ? record.empreiteira.toLowerCase().includes(empreiteira) : true;
            const matchObra = obra ? record.obra.toLowerCase().includes(obra) : true;
            return matchLiberacao && matchData && matchEmpreiteira && matchObra;
        });
        renderQualityRecords(filtered); // Renderiza os registros filtrados e atualiza currentDisplayedRecords
    }

    // Limpa os filtros
    clearFiltersBtn.addEventListener('click', () => {
        filterLiberacao.value = '';
        filterData.value = '';
        filterEmpreiteira.value = '';
        filterObra.value = '';
        renderQualityRecords(); // Exibe todos os registros novamente e atualiza currentDisplayedRecords
    });

    // Event listeners para os filtros
    applyFiltersBtn.addEventListener('click', applyFilters);
    filterLiberacao.addEventListener('input', applyFilters);
    filterData.addEventListener('change', applyFilters);
    filterEmpreiteira.addEventListener('input', applyFilters);
    filterObra.addEventListener('input', applyFilters);


    // --- Importação de Excel ---
    importExcelBtn.addEventListener('click', () => {
        const file = excelFileInput.files[0];
        if (!file) {
            alert('Por favor, selecione um arquivo Excel.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            const newRecords = json.map(row => ({
                // Adicionei mais flexibilidade para os nomes das colunas (maiúsculas/minúsculas)
                liberacao: row.LIBERACAO || row.liberacao || '',
                data: row.DATA ? (typeof row.DATA === 'number' ? excelDateToISODate(row.DATA) : row.DATA) : '',
                empreiteira: row.EMPREITEIRA || row.empreiteira || '',
                obra: row.OBRA || row.obra || '',
                qtde: parseInt(row.QTDE || row.qtde) || 0,
                saldo: parseInt(row.SALDO || row.saldo) || 0
            }));

            qualityRecords = [...qualityRecords, ...newRecords]; // Adiciona os novos registros
            saveRecords();
            applyFilters(); // Aplica os filtros novamente para renderizar os novos dados
            alert('Dados importados com sucesso!');
        };
        reader.readAsArrayBuffer(file);
    });

    // Função auxiliar para converter data do Excel (número serial) para formato ISO
    function excelDateToISODate(excelDate) {
        if (typeof excelDate === 'number') {
            // Excel data starts from Jan 1, 1900. Unix epoch starts from Jan 1, 1970.
            // 25569 is the number of days between 1900-01-01 and 1970-01-01
            // Adding 1 because Excel considers 1900 a leap year, which it isn't.
            const date = new Date((excelDate - (25567 + 1)) * 86400 * 1000);
            return date.toISOString().split('T')[0];
        }
        return excelDate; // Retorna como está se não for número
    }

    // --- Geração de PDF ---
    generatePdfBtn.addEventListener('click', () => {
        if (typeof window.jspdf.jsPDF === 'undefined') {
            alert("A biblioteca jsPDF não foi carregada corretamente. Verifique a conexão.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');

        doc.setFontSize(18);
        doc.text("Relatório de Controle de Qualidade", doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

        const tableColumn = ["Liberação", "Data", "Empreiteira", "Obra", "Qtde", "Saldo"];
        const tableRows = [];

        // ***** PONTO CHAVE: Usar 'currentDisplayedRecords' para gerar o PDF *****
        currentDisplayedRecords.forEach(record => {
            const recordData = [
                record.liberacao,
                record.data,
                record.empreiteira,
                record.obra,
                record.qtde.toString(),
                record.saldo.toString()
            ];
            tableRows.push(recordData);
        });

        if (tableRows.length === 0) {
            alert('Não há dados para gerar o relatório PDF.');
            return;
        }

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 70,
            styles: { fontSize: 10, cellPadding: 5 },
            headStyles: { fillColor: [44, 62, 80], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        doc.save('relatorio_qualidade.pdf');
        alert('Relatório PDF gerado com sucesso!');
    });

    // --- Funcionalidade de Estoque e Cadastro de Cliente ---
    clienteForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const clienteNome = document.getElementById('clienteNome').value;
        const itemComprado = document.getElementById('itemComprado').value;
        const qtdeComprada = parseInt(document.getElementById('qtdeComprada').value);
        const tipoAlteracao = document.getElementById('tipoAlteracaoEstoque').value;

        if (isNaN(qtdeComprada) || qtdeComprada <= 0) {
            alert('Por favor, insira uma quantidade válida para a compra.');
            return;
        }

        if (tipoAlteracao === 'saida') {
            if (estoqueAtual >= qtdeComprada) {
                estoqueAtual -= qtdeComprada;
                alert(`Estoque atualizado: ${estoqueAtual}. Saída de ${qtdeComprada} para ${itemComprado} (cliente: ${clienteNome}).`);
            } else {
                alert('Estoque insuficiente para esta saída!');
                return; // Impede o registro se não houver estoque
            }
        } else if (tipoAlteracao === 'entrada') {
            estoqueAtual += qtdeComprada;
            alert(`Estoque atualizado: ${estoqueAtual}. Entrada de ${qtdeComprada} de ${itemComprado} (cliente: ${clienteNome}).`);
        }

        estoqueAtualInput.value = estoqueAtual; // Atualiza o campo de estoque
        const newClienteRecord = {
            clienteNome,
            itemComprado,
            qtdeComprada,
            tipoAlteracaoEstoque: tipoAlteracao
        };
        clienteRecords.push(newClienteRecord);

        saveRecords();
        renderClienteRecords();
        clienteForm.reset();
    });

    // --- Inicialização ---
    applyFilters(); // Chamada inicial para renderizar todos os registros e popular currentDisplayedRecords
    renderClienteRecords(); // Carrega os registros de cliente ao iniciar

    // Importar jsPDF AutoTable plugin (esta linha pode ser removida se o CDN já incluir)
    if (typeof window.jspdf.jsPDF !== 'undefined' && typeof window.jspdf.autoTable === 'undefined') {
        // Isso é uma tentativa de garantir que autoTable esteja disponível se não vier no bundle principal.
        // Em muitos casos de CDN, ele já vem junto.
        // Se ainda der erro, você pode precisar de um CDN específico para jsPDF AutoTable.
        // window.jspdf.jsPDF.API.autoTable = window.jspdf.autoTable; // Isso só funciona se autoTable já for global
    }
});