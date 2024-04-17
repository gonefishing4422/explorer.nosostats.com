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

async function compileOrdersChart(startingBlockHeight, blockInterval) {
  return new Promise(async (resolve, reject) => {
    try {
      // Fetch orders for the specified block interval
      const blockOrderPromises = [];
      for (let i = 0; i < blockInterval; i++) {
        const blockHeight = startingBlockHeight + i; // Adjusted starting block height
        // Asynchronously fetch block orders
        const orderPromise = fetchBlockOrders(blockHeight);
        blockOrderPromises.push(orderPromise);
      }
      
      // Wait for all order promises to resolve
      const blockOrders = await Promise.all(blockOrderPromises);

      // Process and display the orders
      const ordersChart = document.getElementById('orders-chart');
      ordersChart.innerHTML = ''; // Clear existing content

      // Create table element
      const orderTable = document.createElement('table');
      orderTable.classList.add('order-table');

      // Create table header
      const headerRow = document.createElement('tr');
      ['Block', 'Timestamp', 'Transfers', 'Sender', 'Receiver', 'Amount', 'Fee', 'Reference'].forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
      });
      orderTable.appendChild(headerRow);

      // Add orders to the table
      const allOrders = [];
      blockOrders.forEach((blockOrder, index) => {
        const blockNumber = startingBlockHeight + index; // Adjusted block number
        const orders = blockOrder.result[0].orders;

        orders.forEach(order => {
          if (order.fee > 0) {
            allOrders.push({
              blockNumber,
              orderID: order.orderid,
              timestamp: new Date(order.timestamp * 1000).toLocaleString(),
              transfers: order.trfrs,
              receiver: order.receiver,
              amount: order.amount * 0.00000001,
              fee: order.fee * 0.00000001,
              reference: order.reference,
              sender: order.sender
            });
          }
        });
      });

      // Sort orders by amount in descending order
      allOrders.sort((a, b) => b.amount - a.amount);

      // If there are no orders, display "No coin movements found"
      if (allOrders.length === 0) {
        const noResultsRow = document.createElement('tr');
        const noResultsCell = document.createElement('td');
        noResultsCell.textContent = 'No coin movements found';
        noResultsCell.colSpan = 8; // Span across all columns
        noResultsRow.appendChild(noResultsCell);
        orderTable.appendChild(noResultsRow);
      } else {
        // Add sorted orders to the table
        allOrders.forEach(order => {
          const row = document.createElement('tr');
          [`<a target="_blank" href="getblockinfo.html?blockheight=${order.blockNumber}">${order.blockNumber}</a>`, order.timestamp, order.transfers,`<a target="_blank" href="getaddressbalance.html?address=${order.sender}">${order.sender}</a>`,  
          `<a target="_blank" href="getaddressbalance.html?address=${order.receiver}">${order.receiver}</a>`, 
          order.amount.toFixed(8), order.fee.toFixed(8), order.reference].forEach(cellData => {
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
      }

      ordersChart.appendChild(orderTable);

      // Resolve the Promise once chart is compiled
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}


// Function to handle changes in the time range dropdown
async function handleTimeRangeChange(selectedTimeRange) {
  let blockInterval = 0;
  switch (selectedTimeRange) {
    case 'hour':
      blockInterval = 6; // 6 blocks in an hour
      break;
    case 'day':
      blockInterval = 144; // 144 blocks in a day
      break;
    case 'week':
      blockInterval = 1008; // 1008 blocks in a week
      break;
    default:
      console.error('Invalid time range');
      return;
  }

  // Calculate the starting block height based on the current block height
  const currentBlockHeight = await getCurrentBlockHeight();
  const startingBlockHeight = currentBlockHeight - blockInterval;

  compileOrdersChart(startingBlockHeight, blockInterval)
    .then(() => {
      // Optionally handle any post-processing logic here
    })
    .catch(error => {
      console.error('Error compiling orders chart:', error);
    });
}

// Function to handle the search by block number
async function handleBlockSearch(event) {
  event.preventDefault();
  const blockNumberInput = document.getElementById('blockNumberInput');
  const blockNumber = parseInt(blockNumberInput.value);
  if (!isNaN(blockNumber)) {  
    // Get the selected time range
    const timeRangeSelect = document.getElementById('timeRange');
    const selectedTimeRange = timeRangeSelect.value;

    let blockInterval = 0;
    switch (selectedTimeRange) {
      case 'hour':
        blockInterval = 6; // 6 blocks in an hour
        break;
      case 'day':
        blockInterval = 144; // 144 blocks in a day
        break;
      case 'week':
        blockInterval = 1008; // 1008 blocks in a week
        break;
      default:
        console.error('Invalid time range');
        return;
    }

    // Calculate the starting block height based on the entered block number
    const startingBlockHeight = blockNumber - blockInterval;

    // Call compileOrdersChart to compile orders based on the calculated starting block height and block interval
    await compileOrdersChart(startingBlockHeight, blockInterval);
  } else {
    console.error('Invalid block number');
  }
}

// Add event listener to the time range dropdown
document.getElementById('timeRange').addEventListener('change', async function() {
  const selectedTimeRange = this.value;
  await handleTimeRangeChange(selectedTimeRange);
});

// Add event listener to the block search form
document.getElementById('blockSearchForm').addEventListener('submit', handleBlockSearch);

// Initial call to compile orders chart with the default time range (e.g., Last hour)
handleTimeRangeChange('hour'); // Initially set to last hour
// Function to prepopulate the search input field with the current block height
async function prepopulateSearchInput() {
  try {
    // Fetch the current block height
    const currentBlockHeight = await getCurrentBlockHeight();
    
    // Set the value of the search input field
    const blockNumberInput = document.getElementById('blockNumberInput');
    blockNumberInput.value = currentBlockHeight;
  } catch (error) {
    console.error('Error prepopulating search input:', error);
  }
}

// Call the function to prepopulate the search input field when the page loads
prepopulateSearchInput();
