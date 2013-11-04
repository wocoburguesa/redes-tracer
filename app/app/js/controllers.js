'use strict';

/* Controllers */

angular.module('tracerApp.controllers', []).
    controller('HomeCtrl', [
        '$scope', '$http',
        function ($scope, $http) {
            $scope.currentCountry = 'Country';
            $scope.centers = {
                'Brazil': {
                    lat: -10,
                    lng: -55,
                    zoom: 4
                },
                'Peru': {
                    lat: -10,
                    lng: -76,
                    zoom: 4
                },
                'Colombia': {
                    lat: 4,
                    lng: -72,
                    zoom: 4
                },
                'Chile': {
                    lat: -30,
                    lng: -71,
                    zoom: 4
                },
                'Argentina': {
                    lat: -34,
                    lng: -64,
                    zoom: 4
                },
                'Bolivia': {
                    lat: -17,
                    lng: -65,
                    zoom: 4
                },
                'Ecuador': {
                    lat: -2,
                    lng: -77.5,
                    zoom: 4
                }
            };
            $scope.currentIP = 'IP';
            $scope.center = {
                lat: 0.0,
                lng: 0.0,
                zoom: 2
            };

            $scope.displayedItems = [];

            $scope.$watch('displayedItems', function (newValue, oldValue) {
                console.log(newValue);
            });

            $scope.changeCountry = function (country) {
                $scope.showMap = true;
                $scope.currentCountry = country;
                $scope.center = $scope.centers[country];
                $scope.IPs = [];
                for (var ip in $scope.hopsData[country]) {
                    $scope.IPs.push(ip);
                }
            };

            $scope.displayHops = function (country, ip) {
                $scope.currentIP = ip;
                $scope.hops = $scope.hopsData[country][ip];
            };

            $http.get('hops-data.json').
                success(function (data) {
                    $scope.hopsData = data;
                    $scope.countries = [];
                    for (var country in data) {
                        $scope.countries.push(country);
                    }
                });
        }
    ]);