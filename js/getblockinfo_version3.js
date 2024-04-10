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
      "method": "getmainnetinfo",
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

// Variable to store the highest block displayed in the table
let highestBlock = 0;

// Function to navigate to the previous 15 blocks
async function goBack() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    let currentBlock = parseInt(urlParams.get('blockheight'));

    // Calculate the block height for the previous 15 blocks
    let targetBlock = Math.max(currentBlock - 15, 1);

    // Fetch information for the previous 15 blocks
    const previousBlocksData = await Promise.all(
      Array.from({ length: 15 }, (_, i) => fetchBlockInfo(targetBlock + i))
    );

    // Update the table with information for the previous 15 blocks
    updateTable(previousBlocksData.map(data => data.result[0]));

    // Update the URI block height to the highest block in the table
    const highestBlock = Math.min(...previousBlocksData.map(data => data.result[0].number));
    window.history.replaceState(null, null, `?blockheight=${highestBlock}`);
  } catch (error) {
    console.error(error);
  }
}

// Function to navigate to the next 15 blocks
async function goForward() {
  try {
    // Fetch the highest block number currently displayed in the table
    const urlParams = new URLSearchParams(window.location.search);
    let currentBlock = parseInt(urlParams.get('blockheight'));

    // Fetch information for the next 15 blocks starting from the highest block
    const nextBlocksData = await Promise.all(
      Array.from({ length: 15 }, (_, i) => fetchBlockInfo(currentBlock + i + 1))
    );

    // Update the table with information for the next 15 blocks
    updateTable(nextBlocksData.map(data => data.result[0]));

    // Update the URI block height to the highest block in the table
    const highestBlock = Math.max(...nextBlocksData.map(data => data.result[0].number));
    window.history.replaceState(null, null, `?blockheight=${highestBlock}`);
  } catch (error) {
    console.error(error);
  }
}

// Function to handle fetching block info and populating the table
async function handleBlockInfo() {
  try {
    let blockHeight = parseBlockHeightFromURL();
    let currentBlockData;

    if (!blockHeight) {
      blockHeight = await getCurrentBlockHeight();
      // Update the URL path with the retrieved block height
      window.history.replaceState(null, null, `?blockheight=${blockHeight}`);
    }

    // Fetch information for the current block
    currentBlockData = await fetchBlockInfo(blockHeight);
    highestBlock = currentBlockData.result[0].number; // Update highest block

    // Fetch information for the previous 14 blocks
    const previousBlocksData = await Promise.all(
      Array.from({ length: 14 }, (_, i) => fetchBlockInfo(blockHeight - i - 1))
    );

    // Combine current block data and previous block data
    const blockData = [currentBlockData, ...previousBlocksData];

    // Update the table with information for the current block and the previous 14 blocks
    updateTable(blockData.map(data => data.result[0]));
  } catch (error) {
    console.error(error);
  }
}

// Function to update the table with block information
function updateTable(blocks) {
  const table = document.getElementById("getblockinfotable");
  const tbody = table.querySelector("tbody");

  // Clear existing content in the table body
  tbody.innerHTML = '';

  // Sort blocks by block number in descending order
  blocks.sort((a, b) => b.number - a.number);

  // Create table rows for each block
  blocks.forEach(block => {
    const row = document.createElement('tr');
    row.classList.add('data-row');

    // Add table cells for each column
    const cells = [
      `<a href="getblockinfo.html?blockheight=${block.number}">${block.number}</a>`,
      new Date(block.timestart * 1000).toLocaleString(),
      new Date(block.timeend * 1000).toLocaleString(),
      `<a href="getblockorders.html?blockheight=${block.number}">${block.totaltransactions}</a>`,
      block.hash,
      `<a href="getaddressbalance.html?address=${block.miner}">${block.miner}</a>`,
      (block.reward * 0.00000001).toFixed(8),
      (block.feespaid * 0.00000001).toFixed(8)
    ];

    cells.forEach(cellData => {
      const cell = document.createElement('td');
      cell.innerHTML = cellData;
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });
}

// Call the function to handle block info retrieval and table population
handleBlockInfo();
