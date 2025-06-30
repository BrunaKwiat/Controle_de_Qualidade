document.getElementById('excelFile').addEventListener('change', function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const container = document.getElementById('formContainer');
    container.innerHTML = ''; // limpa

    rows.forEach((row, index) => {
      const form = document.createElement('form');

      for (const key in row) {
        const label = document.createElement('label');
        label.textContent = key;

        const input = document.createElement('input');
        input.type = 'text';
        input.name = key;
        input.value = row[key];

        form.appendChild(label);
        form.appendChild(input);
      }

      container.appendChild(form);
    });
  };

  reader.readAsArrayBuffer(file);
});
