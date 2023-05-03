    function refreshTable() {
      fetch('http://api.nosostats.com:8078', {
        method: 'POST',
        headers: {
          'Origin': 'http://api.nosostats.com'
        },
        body: JSON.stringify({
          "jsonrpc": "2.0",
          "method": "getpendingorders",
          "params": [],
          "id": 14
        })
      })
      .then(response => response.json())
      .then(data => {
        const pendings = data.result[0].pendings;
        const tableBody = document.getElementById('getpendingorders');
        tableBody.innerHTML = ''; // clear existing rows
        pendings.slice(0, 23).forEach(pending => {
          const [orderType, sender, receiver, orderAmount, orderFee] = pending.split(',');
          const senderLink = `<a href="rpc/getaddressbalance.html?address=${sender}">${sender}</a>`;
          const receiverLink = `<a href="rpc/getaddressbalance.html?address=${receiver}">${receiver}</a>`;
	const orderAmountFormatted = (orderAmount * 0.00000001).toFixed(8);
	const orderFeeFormatted = (orderFee * 0.00000001).toFixed(8);
	
	const row = `
	  <tr>
	    <td> <img src="img/logo_clearbg.png" width="20px"> ${orderType}</td>
	    <td>${senderLink}</td>
	    <td>${receiverLink}</td>
	    <td>${orderAmountFormatted}</td>
	    <td>${orderFeeFormatted}</td>
	  </tr>
	`;
          tableBody.insertAdjacentHTML('beforeend', row);
        });
      })
      .catch(error => console.error(error));
    }

    refreshTable();
    setInterval(refreshTable, 20000); // refresh every 20 seconds