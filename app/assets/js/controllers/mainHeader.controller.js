/* global _ */

'use strict';

angular.module('Mapwize').controller('MainHeaderCtrl', ['$rootScope', '$scope', 'search', '$location', function ($rootScope, $scope, search, $location) {

    $scope.searchData = {
        query: '',
        mwzResults: [],
        googleResults: [],

        save: {toShow: ''},

        showResults: false
    };

    $scope.searchQueryProgress = false;

    $scope.showOptionsBar = false;

    $scope.lastFocusedField = null;
    $scope.actualFocus = null;

    $scope.resultClick = _.noop;

    /* ---------------------- */

    $scope.showOptions = function (show) {
        $scope.showOptionsBar = show;
    };
    $scope.toggleOptions = function () {
        $scope.showOptionsBar = !$scope.showOptionsBar;
    };

    $scope.setResultClick = function (fn) {
        $scope.resultClick = fn;
    };

    $scope.setFocusedField = function (field) {
        if (field) { // Don't register null field (null is when leave field)
            $scope.lastFocusedField = field;
        }
        $scope.actualFocus = field;
    };

    $scope.showSearchResult = function (show) {
        $scope.searchData.showResults = show;
    };

    $scope.saveActualValue = function (value) {
        $scope.searchData.save = _.cloneDeep(value);
    };

    /* ---------------------- */

    $scope.emptySearchResult = function () {
        return !_.size($scope.searchData.mwzResults) && !$scope.searchData.googleResults.length
    };

    /* ---------------------- */

    function resultsByUniverse(mwzResults) {
        var resultsByUniverse = {};

        if (!_.isEmpty(mwzResults)) {
            resultsByUniverse[$rootScope.activeVenue.activeUniverse] = [];

            _.forEach(mwzResults, function (mwzObject) {
                _.forEach(mwzObject.universes, function (universeId) {
                    if (_.indexOf($rootScope.activeVenue.accessibleUniverses, universeId) !== -1) {
                        if (!resultsByUniverse[universeId]) {
                            resultsByUniverse[universeId] = [];
                        }
                        resultsByUniverse[universeId].push(mwzObject);

                    }
                });
            });
        }

        return resultsByUniverse;
    }

    $scope.$watch('searchData.query', function (searchQuery) {
        if ($scope.actualFocus === 'search') {
            $scope.showSearchResult(true);
        }

        $scope.search(searchQuery, function (err, results) {
            if (err) {
                $scope.safeApply(function () {
                    $scope.searchData.mwzResults = [];
                    $scope.searchData.googleResults = [];
                });
                // TODO show red error message on search result
                return;
            }

            $scope.safeApply(function () {

                if ($rootScope.activeVenue) {
                    $scope.searchData.mwzResults = resultsByUniverse(results.mapwize);
                }
                else {
                    $scope.searchData.mwzResults = results.mapwize;
                }

                $scope.searchData.googleResults = results.google;
            });
        });
    });

    $scope.search = function (searchQuery, callback) {
        if (!searchQuery) {
            $scope.searchData.mwzResults = [];
            $scope.searchData.googleResults = [];
            if ($scope.actualFocus === 'search') {
                $scope.showSearchResult(false);
            }
        }

        $scope.searchQueryProgress = true;

        var options = {};

        options.venueId = $rootScope.activeVenue ? $rootScope.activeVenue._id : null;
        //options.universeId = options.venueId ? $rootScope.map.getUniverseForVenue(options.venueId) || _.first($rootScope.activeVenue.universes) : null;
        options.objectClass = options.venueId ? ($scope.actualFocus === 'from' ? ['place'] : ['place', 'placeList']) : ['venue'];

        var urlSearch = $location.search();
        if (urlSearch.organizationId) {
            options.organizationId = urlSearch.organizationId;
        }
        if (urlSearch.venueId) {
            options.venueId = urlSearch.venueId;
        }

        options.google = !$rootScope.activeVenue;
        options.bounds = $rootScope.map ? $rootScope.map.getBounds() : null;

        search(searchQuery, options, function (err, results) {
            $scope.searchQueryProgress = false;

            if (err) {
                return callback(err);
            }

            callback(null, results);
        });
    };

    $scope.$watch(function () {
        return $rootScope.activeVenue;
    }, function (venue) {
        if (!venue) {
            $scope.showSearchResult(false);
            $scope.setFocusedField(null);
            $scope.searchData.query = '';
        }
    });

}]);
