const urlParams = new URLSearchParams(window.location.search);
const blockHeight = urlParams.get('blockheight');

fetch('https://nosostats.com:8079', {
  method: 'POST',
  headers: {
    'Origin': 'https://nosostats.com'
  },
  body: JSON.stringify({
    "jsonrpc": "2.0",
    "method": "getblockmns",
    "params": [blockHeight],
    "id": 20
  })
}).then(response => response.json())
  .then(data => {
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const headers = ['Valid', 'Block', 'Count', 'Reward', 'Total', 'Addresses'];

    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    data.result.forEach(result => {
      const row = document.createElement('tr');

      Object.keys(result).forEach(key => {
        const cell = document.createElement('td');
        let value = result[key];

        if (key === 'reward' || key === 'total') {
          value = (value * 0.00000001).toFixed(8);
        }

        cell.textContent = value;
        row.appendChild(cell);
      });

      table.appendChild(row);
    });

    document.body.appendChild(table);
  });
