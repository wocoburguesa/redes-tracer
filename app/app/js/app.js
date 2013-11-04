'use strict';


// Declare app level module which depends on filters, and services
angular.module('tracerApp', [
    'ngRoute',
    'tracerApp.filters',
    'tracerApp.services',
    'tracerApp.directives',
    'tracerApp.controllers'
]).
//    factory('hopsData', [
//        '$http',
//        function ()
//    ])

    config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/home', {
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl'
        });
        $routeProvider.otherwise({redirectTo: '/home'});
    }]);
