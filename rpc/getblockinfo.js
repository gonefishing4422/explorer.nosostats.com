const urlParams = new URLSearchParams(window.location.search);
const blockHeight = urlParams.get('blockheight');
console.log(blockHeight); // log block height from URI

fetch('https://nosostats.com:8079', {
  method: 'POST',
  headers: {
    'Origin': 'https://nosostats.com'
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
    { label: "Valid Block", value: result.valid },
    { label: "Block Height", value: `<a href="getblockinfo.html?blockheight=${result.number}">${result.number}</a>` },
    { label: "Start Time", value: result.timestart },
    { label: "End Time", value: result.timeend },
    { label: "Time Total", value: result.timetotal },
    { label: "Last 20", value: result.last20 },
// { label: "Total Transactions", value: result.totaltransactions },
    { label: "Total Transactions", value: `<a href="getblockorders.html?blockheight=${result.number}">${result.totaltransactions}</a>` },
    { label: "Difficulty", value: result.difficulty },
    { label: "Next Difficulty", value: result.nextdifficult },    
    { label: "Last Block Hash", value: result.lastblockhash },    
    { label: "Target", value: result.target },
    { label: "Solution", value: result.solution },
    { label: "Hash", value: result.hash },
 //   { label: "Block Creator", value: result.miner },
    { label: "Block Creator", value: `<a href="getaddressbalance.html?address=${result.miner}">${result.miner}</a>` },    
    { label: "Coins Minted", value: result.reward },    
    { label: "Fees Paid", value: result.feespaid }


  ];

// Get a reference to the table element in your HTML
const table = document.getElementById("getblockinfotable");

// Create the header row
const headerRow = table.insertRow();
const propertyHeader = headerRow.insertCell();
const valueHeader = headerRow.insertCell();
propertyHeader.innerHTML = "Property";
valueHeader.innerHTML = "Value";

// Clear existing rows in the table, except the header row
while (table.rows.length > 1) {
  table.deleteRow(1);
}

// Create a new row in the table for each item in the tableData array
tableData.forEach(data => {
  const row = table.insertRow();
  const labelCell = row.insertCell();
  const valueCell = row.insertCell();
  labelCell.innerHTML = data.label;
  valueCell.innerHTML = data.value;
});
// Calculate Coins Minted and add to table
const reward = tableData.find(data => data.label === "Coins Minted").value;
const rewardRow = table.insertRow();
rewardRow.insertCell().innerHTML = "Coins Minted (Starting)";
rewardRow.insertCell().innerHTML = (reward * 0.00000001).toFixed(8);

// Calculate feesPaid and add to table
const feesPaid = tableData.find(data => data.label === "Fees Paid").value;
const feesPaidRow = table.insertRow();
feesPaidRow.insertCell().innerHTML = "Fees Paid (Added)";
feesPaidRow.insertCell().innerHTML = (feesPaid * 0.00000001).toFixed(8);

// Call processString() to insert POW, MN, and POS rows into the table
const { pow, mn, pos } = processString(result.solution);

// Convert cell values to integers
const powInt = parseInt(pow);
const mnInt = parseInt(mn);
const posInt = parseInt(pos);

// Add POW, MN, and POS rows to the table
const powRow = table.insertRow();
powRow.insertCell().innerHTML = "POP";
const popValueCell = powRow.insertCell();
const popValueLink = document.createElement("a");
const blockHeight = tableData.find(data => data.label === "Block Height").value;
popValueLink.href = `getblockorders.html?blockheight=${result.number}`;
popValueLink.innerText = (powInt * 0.00000001).toFixed(8);
popValueCell.appendChild(popValueLink);

const mnRow = table.insertRow();
mnRow.insertCell().innerHTML = "MN";
mnRow.insertCell().innerHTML = (mnInt * 0.00000001).toFixed(8);

const posRow = table.insertRow();
posRow.insertCell().innerHTML = "POS";
posRow.insertCell().innerHTML = (posInt * 0.00000001).toFixed(8);

// Calculate projectfunds and add to table
const projectfunds = 5000000000 + feesPaid - (powInt + mnInt + posInt);
const projectfundsRow = table.insertRow();
projectfundsRow.insertCell().innerHTML = "Project Funds";
projectfundsRow.insertCell().innerHTML = (projectfunds * 0.00000001).toFixed(8);

// Calculate balance remaining and add to table
const balance = 5000000000 + feesPaid - (powInt + mnInt + posInt + projectfunds);
const balanceRow = table.insertRow();
balanceRow.insertCell().innerHTML = "Balance Remaining (Should Equal 0)";
balanceRow.insertCell().innerHTML = (balance * 0.00000001).toFixed(8);

document.getElementById("output").innerHTML = output;

})
.catch(error => console.error(error));

function processString(solution) {
  const inputStr = solution;
  const startIndex = inputStr.lastIndexOf("!!") + 2;

  const sol = inputStr.slice(startIndex, startIndex + 41);
  let currentIndex = startIndex + 41;

  const powLength = inputStr[currentIndex] === "9" ? 9 : 10;
  const pow = inputStr.slice(currentIndex, currentIndex + powLength);
  currentIndex += powLength;

  const mnLength = inputStr[currentIndex] === "9" ? 9 : 10;
  const mn = inputStr.slice(currentIndex, currentIndex + mnLength);
  currentIndex += mnLength;

  const pos = inputStr.slice(currentIndex);

  return { pow, mn, pos };
}


