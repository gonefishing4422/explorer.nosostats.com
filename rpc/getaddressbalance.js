// Get the address from the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const address = urlParams.get('address');

fetch('https://nosostats.com:8079', {
  method: 'POST',
  headers: {
    'Origin': 'https://nosostats.com'
  },
  body: JSON.stringify({
    "jsonrpc": "2.0",
    "method": "getaddressbalance",
    "params": [address],
    "id": 2
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
    { label: "Valid", value: result.valid },
    { label: "Address", value: `<a href="addresshistory.html?addresshistory=${result.address}">${result.address}</a>` },
    { label: "Alias", value: result.alias },
    { label: "Balance", value: result.balance * 0.00000001 },
    { label: "Incoming", value: result.incoming * 0.00000001 },
    { label: "Outgoing", value: result.outgoing * 0.00000001 }
  ];

  // Get a reference to the table element in your HTML
  const table = document.getElementById("addressbalance-table");

  // Create a new row in the table for each item in the tableData array
  tableData.forEach(data => {
    const row = table.insertRow();
    const labelCell = row.insertCell();
    const valueCell = row.insertCell();
    labelCell.innerHTML = data.label;
    valueCell.innerHTML = data.value;
  });
})
.catch(error => {
  console.log(error);
});
