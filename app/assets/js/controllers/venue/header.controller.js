/* global _ */

'use strict';

angular.module('Mapwize').controller('VenueHeaderCtrl', ['$rootScope', '$scope', '$timeout', function ($rootScope, $scope, $timeout) {

    $scope.focusOnSearch = function () {
        $scope.setFocusedField('searchInVenue');
        $scope.showSearchResult(true);

        $scope.setResultClick(function (searchResult, universeId) {
            if (searchResult) {
                $rootScope.map.setFollowUserMode(false);
                if (searchResult._id) {
                    if (universeId)  {
                        $rootScope.activeVenue.activeUniverse = universeId;
                    }

                    if (searchResult.objectClass === 'place') {
                        $rootScope.setSelected(searchResult);
                        $rootScope.map.centerOnPlace(searchResult._id);
                    }
                    else if (searchResult.objectClass === 'placeList') {
                        $rootScope.setSelected(searchResult);
                        $scope.map.centerOnVenue(searchResult.venue._id);
                    }
                    else {
                        console.error('Unexepted objectClass value' + searchResult.objectClass);
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
            if ((!$scope.actualFocus && $scope.lastFocusedField === 'searchInVenue')) {
                $scope.showSearchResult(false);
                $scope.searchData.query = '';
                $scope.setResultClick(_.noop);
            }
        }, 300);
    };

}]);
