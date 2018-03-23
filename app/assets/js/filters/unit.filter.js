'use strict';

angular.module('Mapwize')
    .filter('secToMin', function () {
        return function (val) {
            val = Math.round(val);
            if (val > 59) {
                return Math.round(val / 60) + 'min';
            }
            else {
                return '1min';
            }
        };
    });

angular.module('Mapwize')
    .filter('meterToKilometer', ['$rootScope', function ($rootScope) {
        filter.$stateful = true;

        return filter;

        function filter(val) {
            if ($rootScope.appUnit === 'ft') {
                val *= 3.28084;
                val = Math.round(val);
                return val + 'ft';
            }
            else {
                val = Math.round(val);
                if (val > 999) {
                    return Math.floor(val / 1000) + ((val % 1000)?(',' + (val % 1000) + 'km'):('km'));
                }
                else {
                    return val + 'm';
                }
            }
        }
    }]);