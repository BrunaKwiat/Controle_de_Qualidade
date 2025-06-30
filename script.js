document.getElementById('formulario').addEventListener('submit', function(event) {
  event.preventDefault();

  const liberacao = document.getElementById('liberacao').value;
  const data = document.getElementById('data').value;
  const empreiteira = document.getElementById('empreiteira').value;
  const obra = document.getElementById('obra').value;
  const qtde = document.getElementById('qtde').value;
  const saldo = document.getElementById('saldo').value;

  const tabela = document.querySelector('#tabela tbody');
  const novaLinha = tabela.insertRow();

  novaLinha.innerHTML = `
    <td>${liberacao}</td>
    <td>${data}</td>
    <td>${empreiteira}</td>
    <td>${obra}</td>
    <td>${qtde}</td>
    <td>${saldo}</td>
  `;

  document.getElementById('formulario').reset();
});
