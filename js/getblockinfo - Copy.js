// Function to parse block height from URL parameters
function parseBlockHeightFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return parseInt(urlParams.get('blockheight'));
}

// Function to make RPC call to retrieve current block height
async function getCurrentBlockHeight() {
  const response = await fetch('https://rpc.nosocoin.com:8078', {
    method: 'POST',
    headers: {
      'Origin': 'https://rpc.nosocoin.com'
    },
    body: JSON.stringify({
      "jsonrpc": "2.0",
      "method":"getmainnetinfo",
      "params": [],
      "id": 1
    })
  });
  
  const data = await response.json();
  if (data.result && data.result.length > 0) {
    return data.result[0].lastblock;
  } else {
    throw new Error('Unable to retrieve current block height');
  }
}

// Function to fetch block information
async function fetchBlockInfo(blockHeight) {
  const response = await fetch('https://rpc.nosocoin.com:8078', {
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
  });
  
  return response.json();
}

// Function to handle fetching block info and populating the table
async function handleBlockInfo() {
  try {
    let blockHeight = parseBlockHeightFromURL();
    if (!blockHeight) {
      blockHeight = await getCurrentBlockHeight();
      // Update the URL path with the retrieved block height
      window.history.replaceState(null, null, `?blockheight=${blockHeight}`);
    }
    console.log("Block Height:", blockHeight);
    
    const data = await fetchBlockInfo(blockHeight);
    console.log("Block Info:", data);
    
    // Create an array of objects containing the table data
    const tableData = [
      { label: "Block Height", value: `<a href="getblockinfo.html?blockheight=${data.result[0].number}">${data.result[0].number}</a>`, priority: 1 },
      { label: "Start Time", value: new Date(data.result[0].timestart * 1000).toLocaleString(), priority: 6 },
      { label: "End Time", value: new Date(data.result[0].timeend * 1000).toLocaleString(), priority: 6 },
      { label: "Total Transactions", value: `<a href="getblockorders.html?blockheight=${data.result[0].number}">${data.result[0].totaltransactions}</a>`, priority: 1 },
      { label: "Hash", value: data.result[0].hash, priority: 6 },
      { label: "Noso Mint Address", value: `<a href="getaddressbalance.html?address=${data.result[0].miner}">${data.result[0].miner}</a>`, priority: 6 },
      { label: "Coins Minted", value: (data.result[0].reward * 0.00000001).toFixed(8), priority: 6 },
      { label: "Fees Paid", value: (data.result[0].feespaid * 0.00000001).toFixed(8), priority: 6 }
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
  } catch (error) {
    console.error(error);
  }
}

// Function to navigate to the previous block
function goBack() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentBlock = parseInt(urlParams.get('blockheight'));
  const previousBlock = currentBlock - 1;
  window.location.href = `getblockinfo.html?blockheight=${previousBlock}`;
}

// Function to navigate to the next block
function goForward() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentBlock = parseInt(urlParams.get('blockheight'));
  const nextBlock = currentBlock + 1;
  window.location.href = `getblockinfo.html?blockheight=${nextBlock}`;
}

// Call the function to handle block info retrieval and table population
handleBlockInfo();
