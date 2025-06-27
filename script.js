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
    let currentFilteredRecords = [...qualityRecords]; // Cópia para aplicar filtros
    let estoqueAtual = parseInt(localStorage.getItem('estoqueAtual')) || 100; // Estoque inicial
    let clienteRecords = JSON.parse(localStorage.getItem('clienteRecords')) || [];

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
            editButton.onclick = () => editQualityRecord(index, record);
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.classList.add('delete-btn');
            deleteButton.onclick = () => deleteQualityRecord(index);
            actionsCell.appendChild(deleteButton);
        });
        currentFilteredRecords = recordsToDisplay; // Atualiza os registros filtrados
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
        if (editingIndex !== undefined) {
            // Se estiver editando, atualiza o registro existente
            qualityRecords[editingIndex] = newRecord;
            delete qualityForm.dataset.editingIndex; // Remove o índice de edição
            qualityForm.querySelector('button[type="submit"]').textContent = 'Adicionar Registro'; // Volta ao texto original
        } else {
            // Senão, adiciona um novo registro
            qualityRecords.push(newRecord);
        }

        saveRecords();
        applyFilters(); // Re-aplica os filtros após adicionar/editar
        qualityForm.reset();
    });

    // Edita um registro de qualidade
    function editQualityRecord(index, record) {
        // Preenche o formulário com os dados do registro selecionado
        document.getElementById('liberacao').value = record.liberacao;
        document.getElementById('data').value = record.data;
        document.getElementById('empreiteira').value = record.empreiteira;
        document.getElementById('obra').value = record.obra;
        document.getElementById('qtde').value = record.qtde;
        document.getElementById('saldo').value = record.saldo;

        // Armazena o índice do registro que está sendo editado no dataset do formulário
        qualityForm.dataset.editingIndex = index;
        // Muda o texto do botão para indicar que está em modo de edição
        qualityForm.querySelector('button[type="submit"]').textContent = 'Atualizar Registro';
    }

    // Exclui um registro de qualidade
    function deleteQualityRecord(index) {
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            // Remove o registro do array original
            qualityRecords.splice(index, 1);
            saveRecords();
            applyFilters(); // Re-aplica os filtros para atualizar a tabela
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
        renderQualityRecords(filtered);
    }

    // Limpa os filtros
    clearFiltersBtn.addEventListener('click', () => {
        filterLiberacao.value = '';
        filterData.value = '';
        filterEmpreiteira.value = '';
        filterObra.value = '';
        renderQualityRecords(); // Exibe todos os registros novamente
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

            // Assumimos que as colunas do Excel têm os mesmos nomes dos campos do formulário
            // Se os nomes forem diferentes, você precisará mapeá-los aqui.
            const newRecords = json.map(row => ({
                liberacao: row.LIBERACAO || '', // Use os nomes das colunas do seu Excel
                data: row.DATA ? new Date(row.DATA).toISOString().split('T')[0] : '', // Converte data se necessário
                empreiteira: row.EMPREITEIRA || '',
                obra: row.OBRA || '',
                qtde: parseInt(row.QTDE) || 0,
                saldo: parseInt(row.SALDO) || 0
            }));

            qualityRecords = [...qualityRecords, ...newRecords]; // Adiciona os novos registros
            saveRecords();
            renderQualityRecords();
            alert('Dados importados com sucesso!');
        };
        reader.readAsArrayBuffer(file);
    });

    // --- Geração de PDF ---
    generatePdfBtn.addEventListener('click', () => {
        if (typeof window.jspdf.jsPDF === 'undefined') {
            alert("A biblioteca jsPDF não foi carregada corretamente. Verifique a conexão.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4'); // 'p' para retrato, 'pt' para pontos, 'a4' para tamanho da página

        doc.setFontSize(18);
        doc.text("Relatório de Controle de Qualidade", doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

        const tableColumn = ["Liberação", "Data", "Empreiteira", "Obra", "Qtde", "Saldo"];
        const tableRows = [];

        // Usa os registros atualmente filtrados para gerar o PDF
        currentFilteredRecords.forEach(record => {
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
    renderQualityRecords(); // Carrega os registros de qualidade ao iniciar
    renderClienteRecords(); // Carrega os registros de cliente ao iniciar

    // Importar jsPDF AutoTable plugin
    // Certifique-se de que o plugin está disponível, geralmente vem com a instalação completa
    // Se estiver usando o CDN, pode ser necessário incluí-lo separadamente ou usar uma versão que já o contenha.
    // Para fins de demonstração, confio que o CDN do jsPDF inclua autoTable.
    if (typeof doc === 'undefined' && typeof window.jspdf.jsPDF !== 'undefined') {
        window.jspdf.jsPDF.API.autoTable = window.jspdf.autoTable;
    }
});