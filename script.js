document.addEventListener('DOMContentLoaded', () => {
    const qualityForm = document.getElementById('qualityForm');
    const qualityTableBody = document.querySelector('#qualityTable tbody');

    let qualityRecords = JSON.parse(localStorage.getItem('qualityRecords')) || [];

    // Função para renderizar os registros na tabela
    function renderRecords() {
        qualityTableBody.innerHTML = ''; // Limpa a tabela antes de renderizar
        qualityRecords.forEach(record => {
            const row = qualityTableBody.insertRow();
            row.insertCell().textContent = record.liberacao;
            row.insertCell().textContent = record.data;
            row.insertCell().textContent = record.empreiteira;
            row.insertCell().textContent = record.obra;
            row.insertCell().textContent = record.qtde;
            row.insertCell().textContent = record.saldo;
        });
    }

    // Lidar com o envio do formulário
    qualityForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        const newRecord = {
            liberacao: document.getElementById('liberacao').value,
            data: document.getElementById('data').value,
            empreiteira: document.getElementById('empreiteira').value,
            obra: document.getElementById('obra').value,
            qtde: parseInt(document.getElementById('qtde').value),
            saldo: parseInt(document.getElementById('saldo').value)
        };

        qualityRecords.push(newRecord);
        localStorage.setItem('qualityRecords', JSON.stringify(qualityRecords)); // Salva no localStorage

        renderRecords(); // Atualiza a tabela
        qualityForm.reset(); // Limpa o formulário
    });

    // Renderiza os registros existentes ao carregar a página
    renderRecords();
});