/* global _ */

'use strict';

angular.module('Mapwize').controller('SearchCtrl', ['$scope', '$rootScope', 'Analytics', function ($scope, $rootScope, Analytics) {

    $scope.placeClick = function (placeElem, universeId) {
        Analytics.trackEvent('search', 'searchSelectPlace', $scope.searchData.query + ' - ' + placeElem.venue.name + ' - ' + placeElem.name);
        $scope.resultClick(placeElem, universeId);
    };
    $scope.venueClick = function (venueElem) {
        Analytics.trackEvent('search', 'searchSelectVenue', $scope.searchData.query + ' - ' + venueElem.name);
        $scope.resultClick(venueElem);
    };
    $scope.placeListClick = function (placeListElem, universeId) {
        Analytics.trackEvent('search', 'searchSelectPlaceList', $scope.searchData.query + ' - ' + placeListElem.venue.name + ' - ' + placeListElem.name);
        $scope.resultClick(placeListElem, universeId);
    };
    $scope.addressClick = function (address) {
        Analytics.trackEvent('search', 'searchSelectAddress', address.formatted_address);
        $scope.resultClick(address);
    };

    $scope.currentPositionClick = function () {
        var pos = _.clone($rootScope.userPosition);
        pos.objectClass = 'userPosition';
        $scope.resultClick(pos);
    };

    $scope.mainPlaceClicked = function (mainElem) {
        Analytics.trackEvent('search', 'searchSelectMainPlace', mainElem.venue.name + ' - ' + mainElem.name);
        $scope.resultClick(mainElem);
    };
    $scope.mainFromClicked = function (mainElem) {
        Analytics.trackEvent('search', 'searchSelectMainFrom', mainElem.venue.name + ' - ' + mainElem.name);
        $scope.resultClick(mainElem);
    };

}]);