/* global _ */

'use strict';

angular.module('Mapwize').directive('mwzMainFroms', function () {
    return {
        scope: { clickOnElement: '=click', venue: '=' },
        restrict: 'E',
        templateUrl: 'assets/tpl/directives/mainFroms.html'
    };
});
