var travelpacks = angular.module('travelpacks', []);

function mainApp($scope) {
	$scope.origin = 'CGK';
	$scope.destination = 'LCY';
	$scope.waktuBerangkat = '11/16/2014';
	$scope.waktuPulang = '11/23/2014';
	$scope.adults = 1;
	$scope.children = 0;
	$scope.stage = 0;

	$scope.convenient = {
		flight : {
			berangkat : {
				name: 'Etihad Airways, BA Cityflyer',
				time: '17:25 - 12:10',
			},
			pulang : {
				name: 'BA Cityflyer, Etihad Airways',
				time: '19:10 - 23:10',
			}
		},
		hotel : {
			name: 'Crowne Plaza London',
			features: ['Internet', 'Spa', 'Gym', 'Pool', 'Lounge']
		},
		car : {
			type: 'Premium',
			name: 'Mercedes-Benz E220 Aut'
		},
		totalPrice: '$11604.24'
	};
	$scope.cheapest = {
		flight : {
			berangkat : {
				name: 'KLM, CityJet',
				time: '19:25 - 13:30',
			},
			pulang : {
				name: 'CityJet, KLM, Garuda Indonesia',
				time: '13:30 - 18:25',
			}
		},
		hotel : {
			name: 'Prince Regent Hotel Excel London',
			features: ['Internet', 'Lounge']
		},
		car : {
			type: 'Mini',
			name: 'Kia Picanto'
		},
		totalPrice: '$3789.26'
	};	
	console.log('tes');
	$scope.processData = function() {
		$scope.stage = 1;
		setTimeout(function() {
			$scope.stage = 2;
			$scope.$apply();
			console.log('tes');
		}, 2000);
	}
}