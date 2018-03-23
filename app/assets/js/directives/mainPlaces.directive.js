/* global _ */

'use strict';

angular.module('Mapwize').directive('mwzMainPlaces', function () {
    return {
        scope: { clickOnElement: '=click', venue: '=', header: '=' },
        restrict: 'E',
        templateUrl: 'assets/tpl/directives/mainPlaces.html'
    };
});
