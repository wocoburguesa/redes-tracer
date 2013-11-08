'use strict';

/* Directives */


angular.module('tracerApp.directives', []).
    directive('appVersion', ['version', function(version) {
        return function(scope, elm, attrs) {
            elm.text(version);
        };
    }]).

    directive('leafletDirective', function () {
        return {
            scope: {
                hops: '=',
                center: '='
            },
            controller: [
                '$scope', '$element', '$timeout',
                'utilsService',
                function ($scope, $element, $timeout,
                         utilsService) {
                    $scope.$watch('hops', function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            $scope.cleanUp();
                            $scope.centerMarker = L.marker(
                                [$scope.center.lat, $scope.center.lng],
                                {icon: new L.NumberedDivIcon({number: '1'})}
                            ).addTo($scope.map);
                            $scope.drawHops($scope.hops);
                        }
                    });

                    $scope.$watch('center', function (newValue, oldValue) {
                        if (newValue !== oldValue && !$scope.map) {
                            $scope.setMap();
                            $scope.centerMarker = L.marker(
                                [$scope.center.lat, $scope.center.lng],
                                {icon: new L.NumberedDivIcon({number: '1'})}
                            ).addTo($scope.map);
                        } else if (newValue !== oldValue) {
                            $scope.cleanUp();
                            $scope.centerMarker = L.marker(
                                [$scope.center.lat, $scope.center.lng],
                                {icon: new L.NumberedDivIcon({number: '1'})}
                            ).addTo($scope.map);
                            $scope.map.setView(
                                [$scope.center.lat, $scope.center.lng],
                                $scope.center.zoom
                            );
                        }
                    });

                    $scope.cleanUp = function () {
                        $scope.$parent.displayedItems = [];
                        $scope.map.removeLayer($scope.centerMarker);
                        if ($scope.hopMarkers) {
                            for (var i=0; i < $scope.hopMarkers.length; i++) {
                                $scope.map.removeLayer($scope.hopMarkers[i]);
                            }
                            $scope.map.removeLayer($scope.path);
                            clearInterval($scope.drawMarkersAndPath);
                        }
                    };

                    $scope.drawPath = function (step, marker) {
                        if (step == 0) {
                            $scope.path = L.polyline([
                                $scope.centerMarker._latlng,
                                marker._latlng
                            ], {color: 'red', dashArray: '5, 5'}).addTo($scope.map);
                        } else {
                            $scope.path.addLatLng(
                                marker._latlng
                            );
                        }

                        $scope.map.fitBounds($scope.path.getBounds());
                    };

                    $scope.addHop = function (container, hop) {
                        var idx = utilsService.searchByLatLng(
                            container,
                            '_latlng',
                            new L.LatLng(hop.latitude, hop.longitude)
                        )
                        if (idx !== -1) {
                            container.push(
                                L.marker(
                                    [hop.latitude, hop.longitude],
                                    {icon: new L.NumberedDivIcon({
                                        number: container[idx].options.icon.options.number + 1
                                    })}
                                )
                            );
                        } else {
                            container.push(
                                L.marker(
                                    [hop.latitude, hop.longitude],
                                    {icon: new L.NumberedDivIcon({number: 1})}
                                )
                            );
                        }
                    };

                    $scope.drawHops = function (hops) {
                        $scope.hopMarkers = [];
                        for (var i=0; i < hops.length; i++) {
                            $scope.addHop($scope.hopMarkers, hops[i]);
                        }

                        var i = 0;
                        $scope.drawMarkersAndPath = setInterval(function () {
                            $scope.hopMarkers[i].addTo($scope.map);

                            $scope.$parent.displayedItems.push(
                                $scope.hops[i]
                            );
                                console.log($scope.hops[i]);
                            $scope.$parent.$apply();

                            $scope.drawPath(i, $scope.hopMarkers[i]);

                            i++;
                            if (i >= $scope.hopMarkers.length) {
                                clearInterval($scope.drawMarkersAndPath);
                            }
                        }, 500);

                    };

                    $scope.makeLayers = function () {
                        $scope.layers = {};
                        $scope.layers.osm = new L.TileLayer(
//                            'http://a.tiles.mapbox.com/v3/wocoburguesa.g6l8dl6h/{z}/{x}/{y}.png',
//                            'http://a.tiles.mapbox.com/v3/aj.sketchy2/{z}/{x}/{y}.png',
                            'http://c.tiles.mapbox.com/v3/examples.a3cad6da/{z}/{x}/{y}.png',
                            {
                            }
                        );
                    };
                    $scope.makeControl = function () {
                        $scope.control = {
                            baseMaps: {
                                "OpenStreetMap": $scope.layers.osm,
                            },
                        };
                        $scope.control.control = L.control.layers(
                            $scope.control.baseMaps
                        );

                        $scope.control.control.addTo($scope.map);
                    };

                    $scope.setMap = function () {
                        $scope.makeLayers();

                        $scope.map = L.map($element[0], {
                            layers: [
                                $scope.layers.osm
                            ]
                        }).setView(
                            [$scope.center.lat, $scope.center.lng],
                            $scope.center.zoom
                        );

                        $scope.makeControl();

                        // ugly hack, leaflet has a bug regarding hidden
                        // DOM elements
                        $timeout(function () {
                            $scope.map.invalidateSize();
                        }, 1);

                    };
                }
            ]
        };
    }).

    directive('leafletDirectiveAll', function () {
        return {
            scope: {
                hops: '=',
                centers: '='
            },
            controller: [
                '$scope', '$element', '$timeout',
                'utilsService',
                function ($scope, $element, $timeout,
                         utilsService) {
                    $scope.$watch('hops', function (newValue, oldValue) {
                        if (newValue !== oldValue) {
//                            $scope.cleanUp();
                            $scope.centerMarkers = [];
                            for (var country in $scope.centers) {
                            $scope.centerMarkers[country] = L.marker(
                                [$scope.centers[country].lat, $scope.centers[country].lng]
                            ).addTo($scope.map);
                            }
                            $scope.drawHops($scope.hops);
                        }
                    });

                    $scope.$parent.$on('changeCountryColor', function (event, data) {
                        for (var ip in $scope.paths[data.country]) {
                            $scope.paths[data.country][ip].setStyle({
                                color: data.color
                            });
                        }
                    });

                    $scope.$watch('centers', function (newValue, oldValue) {
                        if (newValue !== oldValue && !$scope.map) {
                            $scope.setMap();
                            $scope.centerMarker = L.marker(
                                [$scope.center.lat, $scope.center.lng],
                                {icon: new L.NumberedDivIcon({number: '1'})}
                            ).addTo($scope.map);
                        } else if (newValue !== oldValue) {
                            $scope.cleanUp();
                            $scope.centerMarker = L.marker(
                                [$scope.center.lat, $scope.center.lng],
                                {icon: new L.NumberedDivIcon({number: '1'})}
                            ).addTo($scope.map);
                            $scope.map.setView(
                                [$scope.center.lat, $scope.center.lng],
                                $scope.center.zoom
                            );
                        }
                    });

                    $scope.cleanUp = function () {
                        $scope.$parent.displayedItems = [];
                        $scope.map.removeLayer($scope.centerMarker);
                        if ($scope.hopMarkers) {
                            for (var i=0; i < $scope.hopMarkers.length; i++) {
                                $scope.map.removeLayer($scope.hopMarkers[i]);
                            }
                            $scope.map.removeLayer($scope.path);
                            clearInterval($scope.drawMarkersAndPath);
                        }
                    };

                    $scope.drawPath = function (country, ip, step, marker, color) {
                        if (step == 0) {
                            $scope.paths[country][ip] = L.polyline([
                                $scope.centerMarkers[country]._latlng,
                                marker._latlng
                            ], {color: color, dashArray: '5, 5'}).addTo($scope.map);
                        } else {
                            $scope.paths[country][ip].addLatLng(
                                marker._latlng
                            );
                        }

                    };

                    $scope.addHop = function (container, hop) {
                        var idx = utilsService.searchByLatLng(
                            container,
                            '_latlng',
                            new L.LatLng(hop.latitude, hop.longitude)
                        )
                        if (idx !== -1) {
                            container.push(
                                L.marker(
                                    [hop.latitude, hop.longitude],
                                    {icon: new L.NumberedDivIcon({
                                        number: container[idx].options.icon.options.number + 1
                                    })}
                                )
                            );
                        } else {
                            container.push(
                                L.marker(
                                    [hop.latitude, hop.longitude],
                                    {icon: new L.NumberedDivIcon({number: 1})}
                                )
                            );
                        }
                    };

                    $scope.drawHops = function (hops) {
//                        $scope.hopMarkers = [];
                        $scope.hopMarkers = {};
                        $scope.paths = {};
                        for (var country in hops) {
//                            $scope.addHop($scope.hopMarkers, hops[i]);
                            $scope.hopMarkers[country] = {};
                            $scope.paths[country] = {};
                            for (var ip in hops[country]) {
                                $scope.hopMarkers[country][ip] = [];
                                for (var hop in hops[country][ip]) {
                                    $scope.addHop($scope.hopMarkers[country][ip], hops[country][ip][hop]);
                                }
                            }
                        }

                        $scope.bounds = [];
                        for (var country in $scope.hopMarkers) {
                            for (var ip in $scope.hopMarkers[country]) {
                                for (var i=0; i < $scope.hopMarkers[country][ip].length; i++) {
                                    $scope.drawPath(
                                        country,
                                        ip,
                                        i,
                                        $scope.hopMarkers[country][ip][i],
                                        $scope.$parent.countries[country].color
                                    );
                                    $scope.bounds.push($scope.paths[country][ip].getBounds());
                                }
                            }
                        }
                        $scope.map.fitBounds($scope.bounds);
                    };

                    $scope.makeLayers = function () {
                        $scope.layers = {};
                        $scope.layers.osm = new L.TileLayer(
                            'http://c.tiles.mapbox.com/v3/examples.a3cad6da/{z}/{x}/{y}.png',
                            {
                            }
                        );
                    };
                    $scope.makeControl = function () {
                        $scope.control = {
                            baseMaps: {
                                "OpenStreetMap": $scope.layers.osm,
                            },
                        };
                        $scope.control.control = L.control.layers(
                            $scope.control.baseMaps
                        );

                        $scope.control.control.addTo($scope.map);
                    };

                    $scope.setMap = function () {
                        $scope.makeLayers();

                        $scope.map = L.map($element[0], {
                            layers: [
                                $scope.layers.osm
                            ]
                        }).setView(
                            [0.0, 0.0],
                            2
                        );

                        $scope.makeControl();

                        // ugly hack, leaflet has a bug regarding hidden
                        // DOM elements
                        $timeout(function () {
                            $scope.map.invalidateSize();
                        }, 1);

                    };
                    $scope.setMap();

                }
            ]
        };
    });
