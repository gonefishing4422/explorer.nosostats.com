	$(document).ready(function() {
			// Get the search parameter from the URL
			const urlParams = new URLSearchParams(window.location.search);
			const inputVal = urlParams.get('addresshistory');
			if (inputVal) {
				// Trigger the API request with the search parameter
				var loader = $('#loader');
				var table = $('#api-table tbody');
				var apiUrl = 'http://nosostats.ddns.net:49001/api/addressbasic/';
				loader.show();
				table.html('');
				$.ajax({
					url: apiUrl + inputVal,
					type: 'GET',
					dataType: 'json',
					timeout: 3000000, // set the timeout to 300 seconds
					success: function(response){
						var data = response.data.data;
						var tableHtml = '';
						$.each(data, function(i, catData){
							var cat = catData.cat;
							$.each(catData.data, function(j, rowData){
								tableHtml += '<tr>';
								tableHtml += '<td>' + cat + '</td>';
								tableHtml += '<td>' + rowData.amount + '</td>';
								tableHtml += '<td><a href="getblockinfo.html?blockheight=' + rowData.block + '">' + rowData.block + '</a></td>';
								// tableHtml += '<td><a href="addresshistory.html?nosoAddress=' + rowData.receiveFrom + '">' + rowData.receiveFrom + '</a></td>';
								tableHtml += '<td><a href="getaddressbalance.html?address=' + rowData.receiveFrom + '">' + rowData.receiveFrom + '</a></td>';
								tableHtml += '<td>' + rowData.reference + '</td>';
								tableHtml += '<td>' + rowData.timestamp + '</td>';
								tableHtml += '</tr>';
						});
						});
						table.html(tableHtml);
					},
					error: function(jqXHR, textStatus, errorThrown){
						alert('Error: ' + textStatus + ' - ' + errorThrown);
					},
					complete: function() {
						loader.hide();
					}
				});
			}
		});

		// Show/hide the loader based on the Ajax activity
		$(document).ajaxStart(function() {
			$('#loader').show();
		});
		$(document).ajaxStop(function() {
			$('#loader').hide();
		});
