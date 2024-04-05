async function fetchNosoCoinData() {
  try {
    const response = await fetch("https://api.nosocoin.com/info/price?range=day&interval=1");

    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      throw new Error("NosoCoin API request failed");
    }
  } catch (error) {
    console.error("Error fetching NosoCoin data:", error);
    return null;
  }
}

async function fetchBTCValue() {
  try {
    const response = await fetch('https://tradeogre.com/api/v1/markets');
    if (response.ok) {
      const data = await response.json();
      const btcUsdtAsk = data.find(market => market.hasOwnProperty("BTC-USDT"))["BTC-USDT"]["ask"];
      return btcUsdtAsk;
    } else {
      throw new Error("BTC value fetch request failed");
    }
  } catch (error) {
    console.error("Error fetching BTC value:", error);
    return null;
  }
}

async function fetchLockFunds() {
  try {
    const response = await fetch('https://api.nosocoin.com/info/locked_supply');
    const mnLockFunds = await response.text();

    if (!isNaN(mnLockFunds)) {
     const formattedMnLockFunds = (parseFloat(mnLockFunds) / 1000000).toFixed(2) + 'M';
      document.getElementById('mn-lock-funds').innerText = formattedMnLockFunds;
      return mnLockFunds;
    } else {
      throw new Error('mn-lock-funds data not a valid number.');
    }
  } catch (error) {
    console.error('Error fetching mn-lock-funds:', error);
  }
}

function displayLockCount(mnLockFunds) {
  const mnLockCount = mnLockFunds / 10500;
  document.getElementById('mn-lock-count').innerText = mnLockCount;

  // Call the function to calculate and display mn-inactive-nodes with a delay
  setTimeout(() => {
    const nodeCount = parseFloat(document.getElementById('node-count').innerText);
    calculateInactiveNodes(mnLockCount, nodeCount);
  }, 500); // You can adjust the delay time (in milliseconds) as needed
}

function calculateInactiveNodes(mnLockCount, nodeCount) {
  const mnInactiveNodes = mnLockCount - nodeCount;
  document.getElementById('mn-inactive-nodes').innerText = mnInactiveNodes;
}

async function displayData() {
  const nosoUsdtLastPriceElement = document.getElementById("noso-usdt-lastPrice");
  const nosoBtcLastPriceElement = document.getElementById("noso-btc-lastPrice");

  const nosoCoinData = await fetchNosoCoinData();
  if (nosoCoinData && nosoCoinData.length > 0) {
    const lastDataPoint = nosoCoinData[nosoCoinData.length - 1];
    const nosoUsdtLastPrice = lastDataPoint.price.toFixed(2); // Round to two decimal places
    nosoUsdtLastPriceElement.textContent = nosoUsdtLastPrice;

    const btcValue = await fetchBTCValue();
    if (btcValue !== null) {
      const nosoValueInUsdt = lastDataPoint.price; // Use the obtained Noso value
      const nosoToBtcValue = (nosoValueInUsdt / btcValue).toFixed(8); // Round to eight decimal places
      nosoBtcLastPriceElement.textContent = nosoToBtcValue;
    } else {
      nosoBtcLastPriceElement.textContent = "Failed to calculate Noso to BTC value.";
    }
  } else {
    nosoUsdtLastPriceElement.textContent = "API Unavailable.";
    nosoBtcLastPriceElement.textContent = "";
  }
}

// Call the functions when the page loads
fetchLockFunds().then(mnLockFunds => {
  // Call the lock count function after fetching mn-lock-funds
  if (!isNaN(mnLockFunds)) {
    displayLockCount(mnLockFunds);
  }
});

// Function to update the URL with the new blockHeight value
function updateURL(newBlockHeight) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set('blockheight', newBlockHeight);
  const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
  window.history.replaceState(null, '', newUrl);
}

// Function to fetch data for a specific blockHeight
async function fetchDataForBlockHeight(blockHeight) {
  try {
    // Subtract 1 from the blockHeight
    blockHeight -= 1;

    const response = await fetch('https://rpc.nosocoin.com:8078', {
      method: 'POST',
      headers: {
        'Origin': 'https://rpc.nosocoin.com'
      },
      body: JSON.stringify({
        "jsonrpc": "2.0",
        "method": "getblockmns",
        "params": [blockHeight],
        "id": 20
      })
    });
    const data = await response.json();

    // Set IDs for individual elements
    document.getElementById('total-reward').innerText = (data.result[0].total * 0.00000001).toFixed(8);
    document.getElementById('node-count').innerText = data.result[0].count;
    document.getElementById('node-reward').innerText = (data.result[0].reward * 0.00000001).toFixed(8);
    
// Calculate rewards in USDT
const btcValue = parseFloat(await fetchBTCValue());
const nosoCoinData = await fetchNosoCoinData();

if (!isNaN(btcValue) && nosoCoinData && nosoCoinData.length > 0) {
  const lastDataPoint = nosoCoinData[nosoCoinData.length - 1];
  const nosoValueInUsdt = parseFloat(lastDataPoint.price); // Parse as float

  if (!isNaN(nosoValueInUsdt)) {
    const nodeRewardInUsdt = (data.result[0].reward * 0.00000001) * nosoValueInUsdt / btcValue;
    document.getElementById('node-24hr-reward-usdt').innerText = nodeRewardInUsdt.toFixed(2);
  } else {
    document.getElementById('node-24hr-reward-usdt').innerText = "Failed to parse NosoCoin value as float.";
  }
} else {
  document.getElementById('node-24hr-reward-usdt').innerText = "Failed to fetch BTC value or NosoCoin data.";
}



    document.getElementById('node-24hr-reward').innerText = (data.result[0].reward * 0.00000001 * 144).toFixed(0);
    document.getElementById('node-7day-reward').innerText = (data.result[0].reward * 0.00000001 * 1008).toFixed(0);
    document.getElementById('node-30day-reward').innerText = (data.result[0].reward * 0.00000001 * 4320).toFixed(0);
    document.getElementById('node-365day-reward').innerText = (data.result[0].reward * 0.00000001 * 52560).toFixed(0);

    // Blockheight
    const blockheightElement = document.getElementById('blockheight');
    const blockheightLink = document.createElement("a");
    blockheightLink.href = "getblockinfo.html?blockheight=" + blockHeight;
    blockheightLink.textContent = blockHeight;
    blockheightElement.appendChild(blockheightLink);

    // Node Locked Funds
    const nodeCount = data.result[0].count;
    const nodeFundsLocked = parseInt(nodeCount * 10500) / 1000000;
    document.getElementById('node-funds-locked').innerText = nodeFundsLocked.toFixed(2) + 'M';

    // Calculate and set the earning-percentage
    const totalReward = parseFloat(data.result[0].total * 0.00000001);
    const activeNodes = parseInt(data.result[0].count);
    const earningPercentage = (totalReward / (totalReward * activeNodes)) * 100;
    document.getElementById('earning-percentage').innerText = earningPercentage.toFixed(2) + '%';

    // Call the function to calculate and display mn-inactive-nodes
    const mnLockCount = parseFloat(document.getElementById('mn-lock-count').innerText);
    calculateInactiveNodes(mnLockCount, nodeCount);

    // Call the function to fetch data for the line chart
    fetchBlockDataForChart();
  } catch (error) {
    console.error(error);
  }
}


document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  let blockHeight = urlParams.get('blockheight');

  // Fetch the currentHeight if blockHeight is not available
  if (!blockHeight) {
    fetch('https://rpc.nosocoin.com:8078', {
      method: 'POST',
      headers: {
        'Origin': 'https://rpc.nosocoin.com'
      },
      body: JSON.stringify({
        "jsonrpc": "2.0",
        "method": "getmainnetinfo",
        "params": [],
        "id": 9
      })
    })
      .then(response => response.json())
      .then(data => {
        const currentHeight = data.result[0].lastblock;
        blockHeight = currentHeight;
        updateURL(blockHeight);
        fetchDataForBlockHeight(blockHeight);
      })
      .catch(error => console.error(error));
  } else {
    // If blockHeight is available in the URL, directly fetch data
    fetchDataForBlockHeight(blockHeight);
  }

  // Handle the "Back" button click
  document.getElementById('backButton').addEventListener('click', () => {
    if (blockHeight) {
      blockHeight = Math.max(1, parseInt(blockHeight) - 1); // Ensure it doesn't go lower than 1
      updateURL(blockHeight);
      fetchDataForBlockHeight(blockHeight);
      location.reload();
    }
  });

  // Handle the "Forward" button click
  document.getElementById('forwardButton').addEventListener('click', () => {
    if (blockHeight) {
      // Fetch the current height
      fetch('https://rpc.nosocoin.com:8078', {
        method: 'POST',
        headers: {
          'Origin': 'https://rpc.nosocoin.com'
        },
        body: JSON.stringify({
          "jsonrpc": "2.0",
          "method": "getmainnetinfo",
          "params": [],
          "id": 9
        })
      })
        .then(response => response.json())
        .then(data => {
          const currentHeight = data.result[0].lastblock;

          if (blockHeight < currentHeight) {
            blockHeight = parseInt(blockHeight) + 1;
            updateURL(blockHeight);
            fetchDataForBlockHeight(blockHeight);
            location.reload();
          }
        })
        .catch(error => console.error(error));
    }
  });

  // Handle popstate event to fetch and update data when the back/forward button is clicked
  window.addEventListener('popstate', function () {
    blockHeight = urlParams.get('blockheight');
    fetchDataForBlockHeight(blockHeight);
  });

  // Function to fetch data for the past (10x150 = 24hrs) (120x4200 = 30 days) (1200X50400 = 1yr) (2400x100800 = 2yr)
  // Function to fetch data for the line chart
  function fetchBlockDataForChart() {
    const blockIncrement = 3000;
    const totalBlocks = 102800;
    const promises = [];

    // Start fetching from the current block and subtract in increments of 10 until 150 blocks are fetched
    for (let i = 0; i < totalBlocks; i += blockIncrement) {
      const currentBlock = blockHeight - i;

      const promise = fetch('https://rpc.nosocoin.com:8078', {
        method: 'POST',
        headers: {
          'Origin': 'https://rpc.nosocoin.com'
        },
        body: JSON.stringify({
          "jsonrpc": "2.0",
          "method": "getblockmns",
          "params": [currentBlock],
          "id": 21
        })
      })
        .then(response => response.json())
        .then(data => {
          // Process the data for each block and return the relevant information
          const result = data.result[0]; // Assuming you are interested in the first result
          const addresses = result.addresses.split(',');
          return {
            labels: [currentBlock], // Block height for X-axis
            data: [addresses.length], // Count of addresses for Y-axis
          };
        })
        .catch(error => console.error(error));

      promises.push(promise);
    }

    // Once all promises are resolved, update the chart
    Promise.all(promises)
      .then(results => {
        const chartData = {
          labels: [],
          datasets: [{
            // Removed label and legend
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        };

        // Aggregate the results
        results.forEach(result => {
          chartData.labels = chartData.labels.concat(result.labels);
          chartData.datasets[0].data = chartData.datasets[0].data.concat(result.data);
        });

        // Get chart container
        const chartContainer = document.getElementById('lineChart');

        // Ensure the chart container exists
        if (chartContainer) {
          // Create the chart if it doesn't exist
          if (!window.lineChart) {
            window.lineChart = new Chart(chartContainer, {
              type: 'line',
              data: chartData,
              options: {
                scales: {
                  x: {
                    type: 'linear',
                    position: 'bottom'
                  },
                  y: {
                    type: 'linear',
                    position: 'left'
                  }
                },
                // Removed legend
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }
            });
          } else {
            // Update the chart data if it already exists
            window.lineChart.data = chartData;
            window.lineChart.update();
          }
        }
      })
      .catch(error => console.error(error));
  }
});

// Function to calculate and display mn-inactive-nodes
document.addEventListener("DOMContentLoaded", function () {
  const mnLockCount = parseFloat(document.getElementById('mn-lock-count').innerText);
  const nodeCount = parseFloat(document.getElementById('node-count').innerText);
  calculateInactiveNodes(mnLockCount, nodeCount);
});
