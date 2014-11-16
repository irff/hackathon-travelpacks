							if (!error && response.statusCode === 200) {
								console.log(body);
								jsonContent = JSON.stringify(body);
							}
							console.log(response.statusCode);
							console.log('NYAMPE');
							// empty 200 OK response for now
							res.writeHead(200, "OK", {
								'Content-Type': 'text/html',
								'Access-Control-Allow-Origin' : '*'
								});
							console.log(jsonContent);
							res.end(''+jsonContent);
							console.log('SENT');


// --------------
// ONCLICK
	console.log(dataParam);
	$.post('http://localhost:8080/', dataParam, function(data, status) {
		document.write(data);
		console.log(data);
		data = JSON.parse(data);
		for(id in data) {
			console.log(data[id]);
		}
	});
