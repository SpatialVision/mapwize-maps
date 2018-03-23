/* global _ */

'use strict';

angular.module('Mapwize').controller('DefaultHeaderCtrl', ['$rootScope', '$scope', '$timeout', function ($rootScope, $scope, $timeout) {

    $scope.focusOnSearch = function () {
        $scope.setFocusedField('search');
        //$scope.showSearchResult(true);

        $scope.setResultClick(function (searchResult) {
            if (searchResult) {
                $rootScope.map.setFollowUserMode(false);
                if (searchResult._id) {
                    if (searchResult.objectClass === 'venue') {
                        $scope.map.centerOnVenue(searchResult);
                    }
                    else {
                        console.error('Unexepted objectClass value' + searchResult.objectClass);
                    }
                }
                else if (searchResult.geometry) {
                    if (searchResult.geometry.bounds) {
                        var bounds = L.latLngBounds(
                            L.latLng(searchResult.geometry.bounds.southwest.lat, searchResult.geometry.bounds.southwest.lng),
                            L.latLng(searchResult.geometry.bounds.northeast.lat, searchResult.geometry.bounds.northeast.lng)
                        );
                        $rootScope.map.fitBounds(bounds);
                    }
                    else {
                        $rootScope.map.setView(searchResult.geometry.location, 19);
                    }
                }
                else {
                    console.error('Unexepted searchResult value' + searchResult);
                }
            }
        });
    };

    $scope.blurOnSearch = function () {
        $scope.setFocusedField(null);

        $timeout(function () {
            if ((!$scope.actualFocus && $scope.lastFocusedField === 'search')) {
                $scope.showSearchResult(false);
                $scope.searchData.query = '';
                $scope.setResultClick(_.noop);
            }
        }, 300);
    };

}]);
