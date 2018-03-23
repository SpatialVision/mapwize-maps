/* global _ */

'use strict';

angular.module('Mapwize').controller('DirectionHeaderCtrl', ['$rootScope', '$scope', '$timeout', function ($rootScope, $scope, $timeout) {


    /* ---------------------- */

    $scope.initMenu = function () {
        if ($rootScope.isSmallScreen) {
            $rootScope.map.setTopMargin(150);
        }

        var pos = $rootScope.map.getUserPosition();
        if (_.isEmpty($rootScope.directionRequest.from.toShow)) {
            if (pos && _.isFinite(pos.floor)) {
                pos.objectClass = 'userPosition';
                pos.toShow = $scope.translate_current_position;
                $rootScope.directionRequest.from = _.clone(pos);
            }
        }

        if (_.isEmpty($rootScope.directionRequest.to.toShow) && $rootScope.selectedElement) {
            $rootScope.directionRequest.to = _.clone($rootScope.selectedElement);

            var dirReqObj = $rootScope.directionRequest.to;
            if (!dirReqObj.toShow) {
                dirReqObj.toShow = $scope.getToShow(dirReqObj);
            }

            $rootScope.setSelected(null);
        }

        $timeout(function () {
            $scope.searchData.query = '';
        }, 0, false);

        if (_.isEmpty($rootScope.directionRequest.from.toShow)) {
            $timeout(function () {
                angular.element(document.getElementById('directionFromField')).focus();
            });
        }
        else if (_.isEmpty($rootScope.directionRequest.to.toShow)) {
            $timeout(function () {
                angular.element(document.getElementById('directionToField')).focus();
            });
        }

        var from = $scope.extractQuery($rootScope.directionRequest.from);
        var to = $scope.extractQuery($rootScope.directionRequest.to);
        if (from && to) {
            $scope.sendDirectionDemand(from, to);
        }
    };

    $scope.$on('reverseDirection', function () {
        var temp = _.clone($rootScope.directionRequest.from);
        $rootScope.directionRequest.from = _.clone($rootScope.directionRequest.to);
        $rootScope.directionRequest.to = temp;

        var from = $scope.extractQuery($rootScope.directionRequest.from);
        var to = $scope.extractQuery($rootScope.directionRequest.to);
        if (from && to) {
            $scope.sendDirectionDemand(from, to);
        }
    });

    $scope.$watch(function () {
        return $rootScope.isAccessible;
    }, function () {
        var from = $scope.extractQuery($rootScope.directionRequest.from);
        var to = $scope.extractQuery($rootScope.directionRequest.to);
        if (from && to) {
            $scope.sendDirectionDemand(from, to);
        }
    });

    /* ---------------------- */

    $scope.$watch('directionRequest.from.toShow', function (val) {
        $scope.searchData.query = val;
    });

    $scope.focusOnFrom = function () {
        $scope.setFocusedField('from');
        $scope.showSearchResult(true);

        $scope.setResultClick(function (searchResult) {
            if (searchResult) {
                $rootScope.directionRequest.from = searchResult;

                var dirReqObj = $rootScope.directionRequest.from;
                if (!dirReqObj.toShow) {
                    dirReqObj.toShow = $scope.getToShow(dirReqObj);
                }

                if (_.isEmpty($rootScope.directionRequest.to.toShow)) {
                    $timeout(function () {
                        angular.element(document.getElementById('directionToField')).focus();
                    });
                }

                var from = $scope.extractQuery($rootScope.directionRequest.from);
                var to = $scope.extractQuery($rootScope.directionRequest.to);
                if (from && to) {
                    $scope.sendDirectionDemand(from, to);
                }
            }
        });

        $scope.showOptions(false);

        if ($rootScope.directionRequest.from.objectClass === 'userPosition' ||
            $rootScope.directionRequest.from.objectClass === 'location' ||
            $rootScope.directionRequest.from.objectClass === 'beacon') {
            $rootScope.directionRequest.from.toShow = '';
        }
        $scope.searchData.query = $rootScope.directionRequest.from.toShow;
    };

    $scope.blurOnFrom = function () {
        $scope.setFocusedField(null);

        $timeout(function () {
            if ($scope.actualFocus !== 'to' && (!$scope.actualFocus && $scope.lastFocusedField === 'from')) {
                $scope.showSearchResult(false);
                $scope.searchData.query = '';
                $scope.setResultClick(_.noop);
            }
        }, 300);
    };

    /* ---------------------- */

    $scope.$watch('directionRequest.to.toShow', function (val) {
        $scope.searchData.query = val;
    });

    $scope.focusOnTo = function () {
        $scope.setFocusedField('to');
        $scope.showSearchResult(true);

        $scope.setResultClick(function (searchResult) {
            if (searchResult) {
                $rootScope.directionRequest.to = searchResult;

                var dirReqObj = $rootScope.directionRequest.to;
                if (!dirReqObj.toShow) {
                    dirReqObj.toShow = $scope.getToShow(dirReqObj);
                }

                if (_.isEmpty($rootScope.directionRequest.from.toShow)) {
                    $timeout(function () {
                        angular.element(document.getElementById('directionFromField')).focus();
                    });
                }

                var from = $scope.extractQuery($rootScope.directionRequest.from);
                var to = $scope.extractQuery($rootScope.directionRequest.to);
                if (from && to) {
                    $scope.sendDirectionDemand(from, to);
                }
            }
        });

        $scope.showOptions(false);

        if ($rootScope.directionRequest.to.objectClass === 'userPosition' ||
            $rootScope.directionRequest.to.objectClass === 'location' ||
            $rootScope.directionRequest.to.objectClass === 'beacon') {
            $rootScope.directionRequest.to.toShow = '';
        }
        $scope.searchData.query = $rootScope.directionRequest.to.toShow;
    };

    $scope.blurOnTo = function () {
        $scope.setFocusedField(null);

        $timeout(function () {
            if ($scope.actualFocus !== 'from' && (!$scope.actualFocus && $scope.lastFocusedField === 'to')) {
                $scope.showSearchResult(false);
                $scope.searchData.query = '';
                $scope.setResultClick(_.noop);
            }
        }, 300);
    };

    /* ---------------------- */

    $scope.latitude = function (data) {
        if (_.isFinite(data.lat)) {
            return data.lat;
        }
        else if (_.isFinite(data.latitude)) {
            return data.latitude;
        }
        return false;
    };
    $scope.longitude = function (data) {
        if (_.isFinite(data.lon)) {
            return data.lon;
        }
        else if (_.isFinite(data.lng)) {
            return data.lng;
        }
        else if (_.isFinite(data.longitude)) {
            return data.longitude;
        }
        return false;
    };

    $scope.extractQuery = function (object) {
        if (object.location) {
            return {
                lat: $scope.latitude(object.location),
                lon: $scope.longitude(object.location),
                floor: object.floor,
                venueId: object.venueId || $rootScope.activeVenue._id
            };
        }
        else if (object.objectClass === 'place') {
            return {placeId: object._id};
        }
        else if (object.objectClass === 'placeList') {
            return {placeListId: object._id};
        }
        else if (_.isFinite($scope.latitude(object)) && _.isFinite($scope.longitude(object))) {
            return {
                lat: $scope.latitude(object),
                lon: $scope.longitude(object),
                floor: object.floor,
                venueId: object.venueId || $rootScope.activeVenue._id
            };
        }
        else if (object.geometry) {
            // Google address result case
            return {
                lat: $scope.latitude(object.geometry.location),
                lon: $scope.longitude(object.geometry.location),
                floor: 0,
                venueId: object.venueId || $rootScope.activeVenue._id
            };
        }
        else {
            return null;
        }
    };

    /* ---------------------- */

    $rootScope.map.on('placeClick', function (e) {
        e.place.objectClass = 'place';
        $scope.resultClick(e.place);
    });
    $rootScope.map.on('click', function (e) {
        if ($scope.lastFocusedField && $rootScope.directionRequest[$scope.lastFocusedField] && _.isEmpty($rootScope.directionRequest[$scope.lastFocusedField].toShow)) {
            $scope.resultClick({
                objectClass: 'location',
                venueId: $rootScope.activeVenue._id,
                latitude: e.latlng.lat,
                longitude: e.latlng.lng,
                floor: $rootScope.map.getFloor()
            });
        }
    });
}]);
