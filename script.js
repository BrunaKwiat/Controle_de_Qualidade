const express = require('express');
const XLSX = require('xlsx');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Defina aqui o caminho do arquivo Excel (pode ser local ou pasta de rede montada no servidor)
const caminhoExcel = path.join(__dirname, 'arquivos', 'arquivo.xlsx');
// Exemplo de caminho de rede (Windows): 
// const caminhoExcel = '\\\\SERVIDOR\\compartilhamento\\arquivo.xlsx';

app.get('/ler-excel', (req, res) => {
  try {
    const workbook = XLSX.readFile(caminhoExcel);
    const primeiraAbaNome = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[primeiraAbaNome];
    const dados = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    res.json({ sucesso: true, dados });
  } catch (err) {
    res.json({ sucesso: false, erro: err.message });
  }
});

const porta = 3000;
app.listen(porta, () => {
  console.log(Servidor rodando em http://localhost:${porta});
});