var travelpacks = angular.module('travelpacks', []);


var key = 'ah302862382028251913963092444464';
var postURL = 'http://partners.api.skyscanner.net/apiservices/browsedates/v1.0';

var market 			= 'US',
	currency		= 'USD',
	locale			= 'en-US',
	origin 			= 'JFK',
	destination 	= 'LHR',
	departureDate 	= '2014-11-20',
	pickUpTime 		= '10:00',
	dropOffTime 	= '10:00',
	returnDate 		= '2014-11-25',
	driverAge 		= 21,
	userIP 			= '127.0.0.1',
	adults 			= 1,
	children 		= 0;

var flightInput = {
	'market'				: market,
	'currency'				: currency,
	'locale'				: locale,
	'originplace'			: origin,
	'destinationplace'		: destination,
	'outbounddate'			: departureDate,
	'inbounddate'			: returnDate,
	'adults'				: adults,
	'children'				: children
};

var hotelInput = {
	'market'				: market,
	'currency'				: currency,
	'locale'				: locale,
	'entityId'				: '1',
	'checkindate'			: departureDate,
	'checkoutdate'			: returnDate,
	'guests'				: adults + children,
	'rooms'					: adults + children
};

var carInput = {
	'market'				: market,
	'currency'				: currency,
	'locale'				: locale,
	'pickupplace'			: destination,
	'dropoffplace'			: destination,
	'pickupdatetime' 		: departureDate + 'T' + pickUpTime,
	'dropoffdatetime' 		: returnDate + 'T' + dropOffTime,
	'driverage' 			: driverAge
};



function processData($scope) {
	var getFlightData = function() {
		var flightURL = 'http://partners.api.skyscanner.net/apiservices/pricing/v1.0';
		var dataParam = {
			flight: true,
			url: flightURL,
			input: flightInput
		};
		console.log(dataParam);
		$.post('http://localhost:8080/', dataParam, function(data, status) {
			console.log(data);
			data = JSON.parse(data);
			for(id in data) {
				console.log(data[id]);
			}
		})
	};

	var getHotelData = function() {
		var hotelURL = 'http://partners.api.skyscanner.net/apiservices/hotels/liveprices/v2';
		var parameter = '';
		for(item in hotelInput) {
			parameter += '/' + hotelInput[item];
		}
		
		var dataURL = hotelURL + parameter + '?apiKey=' + key;
		var dataParam = {
			url: dataURL
		};

		$.post('http://localhost:8080/', dataParam, function(data, status) {
			console.log(data);
			data = JSON.parse(data);
			for(id in data) {
				console.log(data[id]);
			}
		});	
	}

	var getCarData = function() {
		var carURL = 'http://partners.api.skyscanner.net/apiservices/carhire/liveprices/v2';
		var parameter = '';
		for(item in carInput) {
			parameter += '/' + carInput[item];
		}

		var dataURL = carURL + parameter + '?apiKey=' + key + '&userip=' + userIP;
		var dataParam = {
			url: dataURL
		};
		console.log(dataParam);
		$.post('http://localhost:8080/', dataParam, function(data, status) {
			//document.write(data);
			console.log(data);
			data = JSON.parse(data);
			$scope.carData = data;
			for(id in data) {
				console.log(data[id]);
			}
		});	
	};
	getFlightData();
	//getCarData();
	//getHotelData();
}

var parameter = '';
for(item in flightInput) {
	parameter += '/' + flightInput[item];
}
var dataURL = postURL + parameter + '?apiKey=' + key;

var dataParam = {
	url: dataURL
};
