const urlParams = new URLSearchParams(window.location.search);
const blockHeight = urlParams.get('blockheight');
console.log(blockHeight); // log block height from URI

fetch('https://rpc.nosocoin.com:8078', {
  method: 'POST',
  headers: {
    'Origin': 'https://rpc.nosocoin.com'
  },
  body: JSON.stringify({
    "jsonrpc": "2.0",
    "method": "getblocksinfo",
    "params": [blockHeight],
    "id": 18
  })
})
  .then(response => {
    console.log(response); // log response object
    return response.json();
  })
  .then(data => {
    console.log(data); // log parsed data object

    // check if response contains result array
    if (!data.hasOwnProperty('result') || !Array.isArray(data.result)) {
      throw new Error('Invalid response format');
    }

    // Get the result object from the response
    const result = data.result[0];

    // Create an array of objects containing the table data
    const tableData = [
      { label: "Block Height", value: `<a href="getblockinfo.html?blockheight=${result.number}">${result.number}</a>`, priority: 1 },
      { label: "Start Time", value: new Date(result.timestart * 1000).toLocaleString(), priority: 6 },
      { label: "End Time", value: new Date(result.timeend * 1000).toLocaleString(), priority: 6 },
      { label: "Total Transactions", value: `<a href="getblockorders.html?blockheight=${result.number}">${result.totaltransactions}</a>`, priority: 1 },
      { label: "Hash", value: result.hash, priority: 6 },
      { label: "Noso Mint Address", value: `<a href="getaddressbalance.html?address=${result.miner}">${result.miner}</a>`, priority: 6 },
      { label: "Coins Minted", value: (result.reward * 0.00000001).toFixed(8), priority: 6 },
      { label: "Fees Paid", value: (result.feespaid * 0.00000001).toFixed(8), priority: 6 }
    ];

    // Filter out specific columns and their values
    const filteredTableData = tableData.filter(data => {
      const label = data.label.toLowerCase();
      return !(label.includes("last 20") || label.includes("target") || label.includes("solution") || label.includes("last block hash"));
    });

    // Get a reference to the table element in your HTML
    const table = document.getElementById("getblockinfotable");

    // Clear existing content in the table
    table.innerHTML = '';

    // Create div elements for each item in the filteredTableData array
    filteredTableData.forEach(({ label, value, priority }) => {
      const row = document.createElement('div');
      row.classList.add('row');
      
      const labelDiv = document.createElement('div');
      labelDiv.classList.add('label');
      labelDiv.textContent = label;
      row.appendChild(labelDiv);

      const valueDiv = document.createElement('div');
      valueDiv.classList.add('value');
      valueDiv.innerHTML = value;
      if (priority === 1) {
        row.classList.add('priority-1');
      } else if (priority === 6) {
        row.classList.add('priority-6');
      }
      row.appendChild(valueDiv);

      table.appendChild(row);
    });
  })
  .catch(error => console.error(error));

function goBack() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentBlock = parseInt(urlParams.get('blockheight'));
  const previousBlock = currentBlock - 1;
  window.location.href = `getblockinfo.html?blockheight=${previousBlock}`;
}

function goForward() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentBlock = parseInt(urlParams.get('blockheight'));
  const nextBlock = currentBlock + 1;
  window.location.href = `getblockinfo.html?blockheight=${nextBlock}`;
}
