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

// Function to fetch orders for a given block height
async function fetchBlockOrders(blockHeight) {
  const response = await fetch('https://rpc.nosocoin.com:8078', {
    method: 'POST',
    headers: {
      'Origin': 'https://rpc.nosocoin.com'
    },
    body: JSON.stringify({
      "jsonrpc": "2.0",
      "method": "getblockorders",
      "params": [blockHeight],
      "id": 18
    })
  });

  return response.json();
}

// Function to compile orders from the last 20 blocks into a chart
async function compileOrdersChart() {
  try {
    // Get the current block height
    const currentBlockHeight = await getCurrentBlockHeight();
    
    // Fetch orders for the last 20 blocks
    const blockOrderPromises = [];
    for (let i = 0; i < 20; i++) {
      const blockHeight = currentBlockHeight - i;
      blockOrderPromises.push(fetchBlockOrders(blockHeight));
    }
    const blockOrders = await Promise.all(blockOrderPromises);

    // Process and display the orders
    const ordersChart = document.getElementById('orders-chart');
    ordersChart.innerHTML = ''; // Clear existing content

    // Create table element
    const orderTable = document.createElement('table');
    orderTable.classList.add('order-table');

    // Create table header
    const headerRow = document.createElement('tr');
    ['Block', 'Order ID', 'Timestamp', 'Transfers', 'Receiver', 'Amount', 'Fee', 'Reference', 'Sender'].forEach(headerText => {
      const headerCell = document.createElement('th');
      headerCell.textContent = headerText;
      headerRow.appendChild(headerCell);
    });
    orderTable.appendChild(headerRow);

    // Add orders to the table
    blockOrders.forEach((blockOrder, index) => {
      const blockNumber = currentBlockHeight - index;
      const orders = blockOrder.result[0].orders;

      orders.forEach(order => {
        const row = document.createElement('tr');
        [blockNumber, order.orderid, new Date(order.timestamp * 1000).toLocaleString(), order.trfrs, 
        `<a href="getaddressbalance.html?address=${order.receiver}">${order.receiver}</a>`, 
        (order.amount * 0.00000001).toFixed(8), (order.fee * 0.00000001).toFixed(8), order.reference, order.sender].forEach(cellData => {
          const cell = document.createElement('td');
          if (typeof cellData === 'string' && cellData.startsWith('<')) {
            cell.innerHTML = cellData;
          } else {
            cell.textContent = cellData;
          }
          row.appendChild(cell);
        });
        orderTable.appendChild(row);
      });
    });

    ordersChart.appendChild(orderTable);
  } catch (error) {
    console.error(error);
  }
}

// Call the function to compile the orders chart
compileOrdersChart();
