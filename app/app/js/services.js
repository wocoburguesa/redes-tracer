'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('tracerApp.services', []).
    service('utilsService', [
        function () {
            this.searchByLatLng = function (array, propertyName, propertyValue) {
                var idx, found = false;
                for (idx in array) {
                    if (array[idx][propertyName].lat === propertyValue.lat &&
                       array[idx][propertyName].lng === propertyValue.lng) {
                        found = true;
                    }
                }
                if (!found) {
                    return -1;
                } else {
                    return idx;
                }
            };
        }
    ]);
