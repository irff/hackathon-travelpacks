var express		= require('express');
var querystring = require('querystring');
var fs			= require('fs');
var request		= require('request');
var cheerio		= require('cheerio');
var app			= express();
var http = require('http');

var postURL = '';
var postData = {};
var rootDomain = 'http://partners.api.skyscanner.net';
var jsonContent = '';

http.createServer(function (req, res) {
  // set up some routes
  switch(req.url) {
    case '/':
    	if(req.method == 'POST') {
		    console.log("[200] " + req.method + " to " + req.url);
		    console.log('BERHASIL');

		    req.on('data', function(chunk) {
				console.log("Received body data:")
				postData = querystring.parse(chunk.toString());
				postURL = postData.url;
		    	console.log(postURL);					
		    });
			req.on('end', function() {
				var contentType = 'application/json'
				if(postData.flight) {
					request({
						url: postURL,
						data: postData.input,
						headers: {
							'Content-Type' : 'application/x-www-form-urlencoded'
						}
					}, function(error, response, body) {
						if(!error && response.statusCode === 200) {
							console.log(body);
							jsonContent = JSON.stringify(body);
						}
						console.log(jsonContent);
						console.log('DATA FLIGHT KEDUA NYAMPE!');

						res.writeHead(200, 'OK', {
							'Content-Type': 'text/html',
							'Access-Control-Allow-Origin' : '*'
							});
						res.end(''+jsonContent);
					})
				} else
				if(postURL) {
					// CREATE SESSION
					request({
					    url: postURL,
					    json: true,
					    headers: {
					    	'Content-Type' : contentType
					    }
					}, function (error, response, body) {
							if(response.headers.location) {
								var responseURL = response.headers.location;
								console.log('DATA PERTAMA NYAMPE!\nLokasi berikutnya: ' + responseURL);

								request({
									url: rootDomain + responseURL,
									json: true,
									headers: {
										'Content-Type' : 'application/json'
									}
								}, function(error, response, body) {
									if (!error && response.statusCode === 200) {
										console.log(body);
										jsonContent = JSON.stringify(body);
									}
									console.log(jsonContent);
									console.log('DATA KEDUA NYAMPE!');
									// empty 200 OK response for now
									res.writeHead(200, "OK", {
										'Content-Type': 'text/html',
										'Access-Control-Allow-Origin' : '*'
										});
									res.end(''+jsonContent);
								})
							}
						}
					);	
				}
			});	    
	  } else {
	    console.log("[405] " + req.method + " to " + req.url);
	    console.log('GAGAL');
	  }
      break;

    default:
      res.writeHead(404, "Not found", {'Content-Type': 'text/html'});
      res.end('<html><head><title>404 - Not found</title></head><body><h1>Not found.</h1></body></html>');
      console.log("[404] " + req.method + " to " + req.url);
  };
}).listen(8080); // listen on tcp port 8080 (all interfaces)

app.listen('8081');

console.log('Magic happens on port 8081');

exports = module.exports = app;
