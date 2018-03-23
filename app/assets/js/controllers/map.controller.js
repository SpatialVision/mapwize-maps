/* global _, L, Mapwize, async, VERSION, baseUrlQrCodes */

'use strict';

angular.module('Mapwize').controller('MapController', [
    '$rootScope', '$scope', 'CONFIG', '$location', 'query', '$uibModal', '$sce', 'bootbox', '$aside', 'toastr', '$translate', 'Analytics', 'search', '$document',
    function ($rootScope, $scope, CONFIG, $location, query, $uibModal, $sce, bootbox, $aside, toastr, $translate, Analytics, search, $document) {

        function loadTranslations() {
            $translate(['SEARCH.CURRENT_POSITION', 'SEARCH.COORDINATES', 'DIRECTION.ERROR_ENTER_MODE_MESSAGE', 'DIRECTION.NO_RESULT']).then(function (translations) {
                $scope.translate_current_position = translations['SEARCH.CURRENT_POSITION'];
                $scope.translate_coordinates = translations['SEARCH.COORDINATES'];

                $scope.direction_error_enter_mode_message = translations['DIRECTION.ERROR_ENTER_MODE_MESSAGE'];
                $scope.direction_no_result = translations['DIRECTION.NO_RESULT'];
            });
        }
        $rootScope.$on('$translateChangeSuccess', loadTranslations);
        loadTranslations();


        /* ---------------------- */
        /* Start var declarations */

        // Map state
        $rootScope.activeVenue = null;

        $rootScope.defaultIcon = 'assets/img/venue-50.png';

        // Menu venue
        $rootScope.displayMenuVenue = false;

        // Direction
        $scope.directionMode = false;
        $scope.inDirection = false;
        $rootScope.directionRequest = {
            from: {toShow: ''},
            to: {toShow: ''},
            direction: null
        };

        $rootScope.userPosition = null;

        // infos
        $rootScope.selectedElement = null;
        $rootScope.mapMarginBottom = 0;

        $scope.socketIndoorLocationProvider = null;

        /*  End var declarations  */
        /* ---------------------- */

        var urlSearch = $location.search();
        var cacheParams = {};
        var defaultMapOptions = {
            attributionControl: false,
            zoomControl: (!L.Browser.mobile || L.Browser.edge),
            useBrowserLocation: !(urlSearch.indoorLocationSocketUrl && urlSearch.indoorLocationUserId)
        };
        if (urlSearch.venueId) {
            cacheParams.venueId = urlSearch.venueId;
        }
        if (urlSearch.organizationId) {
            cacheParams.organizationId = urlSearch.organizationId;
        }

        if (urlSearch.mainColor) {
            defaultMapOptions.mainColor = '#' + urlSearch.mainColor;
        }
        if (urlSearch.iconUrl) {
            _.set(defaultMapOptions, 'displayMarkerOptions', {
                iconUrl: urlSearch.iconUrl,
                iconSize: [40, 80],
                iconAnchor: [20, 40]
            });
        }

        Mapwize.Api.setOptions(cacheParams);

        $scope.checkInitializationState = function () {
            if ($location.url() !== '/') {
                var url = 'http://mwz.io' + $location.url();
                Mapwize.Url.parse(url, function (err, parsedUrl) {
                    if (parsedUrl) {
                        if (err) {
                            console.error(err);
                        }

                        $scope.initMap(parsedUrl, function () {
                            if (parsedUrl.userPosition) {
                                $rootScope.map.setUserPosition(parsedUrl.userPosition);
                            }
                            if (_.isFinite(parsedUrl.floor)) {
                                $rootScope.map.setFloor(parsedUrl.floor);
                            }
                            if (parsedUrl.language) {
                                $rootScope.map.setPreferredLanguage(parsedUrl.language);
                            }
                            if (parsedUrl.direction) {
                                $rootScope.directionRequest.from = parsedUrl.from;
                                $rootScope.directionRequest.from.toShow = $scope.getToShow(parsedUrl.from);
                                $rootScope.directionRequest.to = parsedUrl.to;
                                $rootScope.directionRequest.to.toShow = $scope.getToShow(parsedUrl.to);
                                $scope.goToDirectionMode();
                                $scope.startDirection(parsedUrl.direction, {dontFitBounds:true});
                            }
                            if (parsedUrl.place || (parsedUrl.to && parsedUrl.to.objectClass === 'place')) {
                                var place = parsedUrl.place || parsedUrl.to;
                                Mapwize.Api.getPlaceType(place.placeTypeId, function (err, placeType) {
                                    place.placeType = placeType;
                                    place.objectClass = 'place';
                                    $scope.setSelected(place);
                                });
                            }

                            $rootScope.map.fire('moveend', $rootScope.map.getCenter());
                        });
                    }
                    else {
                        console.error(err);
                        return $scope.initMap({}, function () {
                            $rootScope.map.fire('moveend', $rootScope.map.getCenter());
                        });
                    }
                });
            }
            else {
                $scope.initMap({});
            }
        };

        $scope.initMap = function (options, callback) {
            options = options || {};
            callback = callback || _.noop;

            var startMap = function (universes) {
                var tmpMap = Mapwize.map('map', _.defaults({
                    outdoorMapProvider: options.outdoorMapProvider,
                    cacheParams: cacheParams,
                    universeByVenue: universes
                }, defaultMapOptions), function (err, mapInstance) {
                    if (err) {
                        console.error('Map init', err);
                        return callback(err);
                    }

                    $scope.safeApply(function () {
                        $rootScope.map = mapInstance;

                        $rootScope.loadingEnded = true;

                        $scope.setListeners();

                        if (urlSearch.indoorLocationSocketUrl && urlSearch.indoorLocationUserId) {
                            $scope.startIndoorLocationProvider(urlSearch.indoorLocationSocketUrl, urlSearch.indoorLocationUserId);
                        }

                        callback(null, mapInstance);
                    });
                });


                if (options.bounds) {
                    var fitBoundsOptions = {};
                    if (options.zoom) {
                        fitBoundsOptions.maxZoom = options.zoom;
                        fitBoundsOptions.minZoom = options.zoom;
                    }
                    tmpMap.fitBounds(options.bounds, fitBoundsOptions);
                }
                else if (options.zoom) {
                    tmpMap.setZoom(options.zoom);
                }

                if ($rootScope.isSmallScreen) {
                    tmpMap.setTopMargin(50);
                    if ($rootScope.activeVenue && ($rootScope.activeVenue.accessibleUniverses.length > 1 || $rootScope.activeVenue.accessibleLanguages.length > 1)) {
                        tmpMap.setBottomMargin(45);
                    }
                }

                if (defaultMapOptions.mainColor) {
                    tmpMap.createCSSSelector('.leaflet-bar a.selectedFloor', 'background-color: ' + defaultMapOptions.mainColor + ' !important;');
                    tmpMap.createCSSSelector('.leaflet-bar a.selectedFloor.hasDirection', 'border-color: ' + defaultMapOptions.mainColor + ' !important;');
                    tmpMap.createCSSSelector('#menuVenue #menuVenue-header', 'border-color: ' + defaultMapOptions.mainColor + ' !important;');
                    tmpMap.createCSSSelector('#mwz-nav-bar .mwz-nav-bar-container', 'border-color: ' + defaultMapOptions.mainColor + ' !important;');
                    tmpMap.createCSSSelector('#mwz-nav-bar .search-field-container input:focus', 'border-color: ' + defaultMapOptions.mainColor + ' !important;');
                    tmpMap.createCSSSelector('#searchResult .list-group-item-mapwize', 'background-color: ' + defaultMapOptions.mainColor + ' !important;');
                    tmpMap.createCSSSelector('.infosBar', 'border-color: ' + defaultMapOptions.mainColor + ' !important;');

                    tmpMap.createCSSSelector('.progress-bar', 'background-color: ' + defaultMapOptions.mainColor + ' !important;');
                    tmpMap.createCSSSelector('a', 'color: ' + defaultMapOptions.mainColor + ' !important;');
                    tmpMap.createCSSSelector('a:hover', 'color: ' + defaultMapOptions.mainColor + ' !important;');
                }

            };

            // Before map loading, we look for the right universe
            // This can be async because of accessible universes query
            var universeForVenue = {};

            if (options.universe) {
                universeForVenue[options.venue._id] = options.universe._id;
            }

            if (options.place || (options.to && options.to.objectClass === 'place')) {
                var place = options.place || options.to;
                query.get('/venues/' + options.venue._id + '/universes', {}, function (universes) {
                    var usableUniverses = _.intersection(universes, place.universes);
                    if (!_.isEmpty(usableUniverses)) {
                        universeForVenue[options.venue._id] = _.first(usableUniverses);
                    }
                    startMap(universeForVenue);
                }, function (err) {
                    console.error('cannot load accessible universes', err);
                    startMap(universeForVenue);
                });

            }
            else {
                startMap(universeForVenue);
            }

        };

        /* ---------------- */

        $rootScope.toggleMenuVenue = function () {
            $rootScope.displayMenuVenue = !$rootScope.displayMenuVenue;
        };
        $rootScope.showMenuVenue = function () {
            $rootScope.displayMenuVenue = true;
        };
        $rootScope.hideMenuVenue = function () {
            $rootScope.displayMenuVenue = false;
        };

        /* ---------------- */

        $rootScope.translate = function (translations, defaultLanguage, attr) {
            if (translations) {
                var translationPreferred = _.find(translations, {language: $rootScope.map.options.language});
                if (translationPreferred) {
                    if (attr) {
                        return translationPreferred[attr];
                    }
                    return translationPreferred;
                }

                var translationDefault = _.find(translations, {language: defaultLanguage});
                if (translationDefault) {
                    if (attr) {
                        return translationDefault[attr];
                    }
                    return translationDefault;
                }

                var translationFirst = _.first(translations);
                if (translationFirst) {
                    if (attr) {
                        return translationFirst[attr];
                    }
                    return translationFirst;
                }

                console.error('Translation not found');
                return null;
            }
        };

        /* ---------------- */

        $scope.getToShow = function (object) {
            if (object.objectClass === 'location' || object.objectClass === 'beacon') {
                return $scope.translate_coordinates;
            }
            if (object.objectClass === 'userPosition') {
                return $scope.translate_current_position;
            }


            if (object.translations) {
                return $rootScope.translate(object.translations, object.venue.preferredLanguage, 'title') || object.name || object.formatted_address || 'error';
            }
            else {
                return object.formatted_address || 'error';
            }
        };

        /* ---------------- */

        $scope.setListeners = function () {
            $rootScope.map.on('placeClick', function (e) {
                if (!$scope.directionMode) {
                    $scope.safeApply(function () {
                        e.place.objectClass = 'place';

                        $rootScope.map.setFollowUserMode(false);
                        $rootScope.setSelected(e.place);
                        $rootScope.map.setView(e.placeFeature.getBounds().getCenter(), $rootScope.map.getZoom());
                        Analytics.trackEvent('Places', 'PlaceClick', e.place.venueId + ' - ' + e.place.name); // FIXME use place.venue.name
                    });
                }
            });
            $rootScope.map.on('venueClick', function (e) {
                $scope.safeApply(function () {
                    $rootScope.map.centerOnVenue(e.venue);
                    Analytics.trackEvent('Venues', 'VenueClick', e.venue.name);
                });
            });
            $rootScope.map.on('click', function () {
                $scope.safeApply(function () {
                    $rootScope.setSelected(null);
                });
            });

            $rootScope.map.on('directionsStart', function (e) {
                $scope.safeApply(function () {
                    $scope.inDirection = true;
                    $scope.directionMode = true;
                    $rootScope.directionRequest.direction = e.directions;
                });
            });

            $rootScope.map.on('venueEnter', function (e) {
                $scope.safeApply(function () {
                    $rootScope.activeVenue = e.venue;
                    if ($rootScope.directionRequest.direction && e.venue._id !== $rootScope.directionRequest.direction.venueId) {
                        $scope.stopDirection();
                        $scope.goToSearchMode();
                    }
                    else if ($rootScope.directionRequest.direction) {
                        $scope.goToDirectionMode();
                        $scope.startDirection($rootScope.directionRequest.direction);
                    }
                });
            });
            $rootScope.map.on('venueExit', function () {
                $scope.safeApply(function () {
                    $rootScope.activeVenue = null;
                    $rootScope.setSelected(null);
                    $rootScope.hideMenuVenue();

                    $scope.goToSearchMode(true);
                });
            });
        };

        $scope.$watch(function () {
            return $rootScope.directionRequest.direction;
        }, function (dir) {
            if (dir) {
                dir.venueId = dir.from.venueId || dir.to.venueId;
            }
        });
        $scope.$watch(function () {
            return $rootScope.map ? $rootScope.map.getUserPosition() : null;
        }, function (userPosition) {
            $rootScope.userPosition = userPosition;
        });


        /* ---------------- */

        $scope.needExtendedBar = function (elem) {
            if (elem) {
                var translation = $rootScope.translate(elem.translations, elem.venue.preferredLanguage, 'subTitle');
                return translation && translation.length > 30;
            }
            return false;
        };

        $scope.resetMarginBottom = function () {
            if ($rootScope.map && $rootScope.isSmallScreen) {
                if ($rootScope.selectedElement && $scope.needExtendedBar($rootScope.selectedElement)) {
                    $rootScope.map.setBottomMargin(145);
                }
                else if ($rootScope.selectedElement) {
                    $rootScope.map.setBottomMargin(45);
                }
                else if ($rootScope.activeVenue && (_.get($rootScope, 'activeVenue.accessibleUniverses.length') > 1 || _.get($rootScope, 'activeVenue.accessibleLanguages.length') > 1)) {
                    $rootScope.map.setBottomMargin(45);
                }
                else {
                    $rootScope.map.setBottomMargin(0);
                }
            }
        };

        $scope.$watch(function () {
            return _.get($rootScope.activeVenue, 'accessibleUniverses');
        }, function () {
            $scope.resetMarginBottom();
        });
        $scope.$watch(function () {
            return _.get($rootScope.activeVenue, 'accessibleLanguages');
        }, function () {
            $scope.resetMarginBottom();
        });

        /* ---------------- */

        $scope.$watch('activeVenue.activeLanguage', function (value, old) {
            if (value && old && !_.isEqual(value, old)) {
                $rootScope.map.setPreferredLanguage(value);
                $document.find('.selectLanguage').blur();
                $rootScope.hideMenuVenue();
            }
        }, true);

        $scope.$watch('activeVenue.activeUniverse', function (value, old) {
            if (value && old && !_.isEqual(value, old)) {
                $rootScope.map.setUniverseForVenue(value, $rootScope.activeVenue._id);
                $document.find('selectUniverse').blur();
                $rootScope.hideMenuVenue();
            }
        }, true);

        /* ---------------- */

        $scope.$watch(function () {
            return $rootScope.selectedElement;
        }, function (object) {
            if ($rootScope.map) {
                $rootScope.map.removeMarkers();
                $rootScope.map.setPromotePlaces([]);

                if (object) {
                    var placesToPromote = [];
                    if (object.objectClass === 'place') {
                        $rootScope.map.addMarker(object);
                        placesToPromote.push(object._id);
                    }
                    else if (object.objectClass === 'placeList') {
                        _.forEach(object.placeIds, function (placeId) {
                            $rootScope.map.addMarker(placeId);
                            placesToPromote.push(placeId);
                        });
                    }

                    $rootScope.map.setPromotePlaces(placesToPromote);
                }

                $scope.resetMarginBottom();
            }
        });

        $rootScope.setSelected = function (object) {
            $rootScope.selectedElement = object;
        };

        $scope.centerOnPlace = function (place) {
            $rootScope.map.centerOnPlace(place._id);
        };

        $scope.$watch(function () {
            return $rootScope.activeVenue;
        }, function (venue) {
            if (venue && !_.isEmpty(venue)) {
                $scope.loadRequiredData(venue._id);
            }
        });

        function getFullPlaceObject(placeId, callback) {
            Mapwize.Api.getPlace(placeId, function (err, place) {
                if (err) {
                    return callback(err);
                }

                Mapwize.Api.getPlaceType(place.placeTypeId, function (err, placeType) {
                    if (err) {
                        return callback(err);
                    }

                    place.placeType = placeType;
                    place.objectClass = 'place';

                    callback(null, place);
                });
            });
        }

        $scope.loadRequiredData = function (venueId) {

            var callNext = function (next) {
                return function (result) {
                    next(null, result);
                };
            };

            async.parallel({
                universes: function (next) {
                    query.get('/universes', {}, callNext(next), next);
                },
                accessibleUniverses: function (next) {
                    query.get('/venues/' + venueId + '/universes', {}, callNext(next), next);
                },
                languages: function (next) {
                    query.get('/languages', {}, callNext(next), next);
                },
                mainSearches: function (next) {
                    async.map($rootScope.activeVenue.mainSearches, function (mainSearchObject, nextId) {
                        if (mainSearchObject.objectClass === 'place') {
                            getFullPlaceObject(mainSearchObject.objectId.toString(), function (err, place) {
                                if (err) {
                                    console.error('mainSearches getFullPlaceObject', err);
                                    return nextId();
                                }
                                nextId(null, place);
                            });
                        }
                        else {
                            Mapwize.Api.getPlaceList(mainSearchObject.objectId.toString(), function (err, placeList) {
                                if (err) {
                                    console.error('mainSearches getPlaceList', err);
                                    return nextId();
                                }

                                placeList.objectClass = 'placeList';
                                nextId(null, placeList);
                            });
                        }
                    }, next);
                },
                mainFroms: function (next) {
                    async.map($rootScope.activeVenue.mainFroms, function (o, nextId) {
                        getFullPlaceObject(o.toString(), function (err, place) {
                            if (err) {
                                console.error('mainFroms getFullPlaceObject', err);
                                return nextId();
                            }
                            nextId(null, place);
                        });
                    }, next);
                }
            }, function (err, results) {
                if (err) {
                    return console.error('loadRequiredData', err);
                }

                var mainSearchesCompacted = _.compact(results.mainSearches);
                var mainFromsCompacted = _.compact(results.mainFroms);

                var assignToVenue = function (fiveFirstPlaces) {
                    $scope.safeApply(function () {
                        _.assign($rootScope.activeVenue, {
                            universesById: _.keyBy(results.universes, '_id'),
                            accessibleUniverses: results.accessibleUniverses,
                            languagesByCode: _.keyBy(results.languages, 'code'),

                            activeLanguage: $rootScope.map.options.language || $rootScope.activeVenue.defaultLanguage,
                            activeUniverse: $rootScope.map.getUniverseForVenue($rootScope.activeVenue._id) || _.first($rootScope.activeVenue.universes),
                            accessibleLanguages: $rootScope.activeVenue.supportedLanguages,

                            mainPlaces: !_.isEmpty(mainSearchesCompacted) ? mainSearchesCompacted : _.cloneDeep(fiveFirstPlaces),
                            mainFroms: !_.isEmpty(mainFromsCompacted) ? mainFromsCompacted : _.cloneDeep(fiveFirstPlaces)
                        });
                    });
                };

                if (_.isEmpty(mainSearchesCompacted) || _.isEmpty(mainFromsCompacted)) {
                    query.get('/places', {venueId: $rootScope.activeVenue._id, pageSize: 5}, function (places) {
                        assignToVenue(_.map(_.take(places, 5), function (place) {
                            place.objectClass = 'place';
                            return place;
                        }));
                    }, function (err) {
                        console.error('Get five first places', err);
                        assignToVenue([]);
                    });
                }
                else {
                    assignToVenue([]);
                }



            });
        };

        /* ---------------- */
        // Details popup
        /* ---------------- */

        $scope.openDetails = function (place) {
            var translation = $rootScope.translate(place.translations, $rootScope.selectedElement.venue.preferredLanguage);
            var detailsUrl = CONFIG.SERVER_URL + '/v1/places/' + place._id + '/details?lang=' + translation.language + '&api_key=' + CONFIG.API_KEY;
            $uibModal.open({
                size: 'lg',
                templateUrl: 'detailsModal.html',
                controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                    $scope.detailsUrl = $sce.trustAsResourceUrl(detailsUrl);

                    $scope.close = function () {
                        $uibModalInstance.dismiss('close');
                    };
                }]
            }).result.then(_.noop, _.noop);
        };

        /* ---------------- */
        // Direction
        /* ---------------- */

        $scope.goToDirectionMode = function () {
            $scope.hideMenuVenue();
            $scope.directionMode = true;
            Analytics.trackEvent('Directions', 'goToDirectionMode', '');
        };
        $scope.goToSearchMode = function (preventClearDirection) {
            $scope.directionMode = false;

            $scope.stopDirection(preventClearDirection);
            if ($rootScope.isSmallScreen) {
                $rootScope.map.setTopMargin(50);
            }

            Analytics.trackEvent('search', 'goToSearchMode', '');
        };

        $scope.startDirection = function (direction, options) {
            $scope.inDirection = true;
            $rootScope.directionRequest.direction = direction;
            $rootScope.map.removeMarkers();
            $rootScope.map.startDirections(direction, options);

            if ($rootScope.isSmallScreen) {
                $rootScope.map.setBottomMargin(50);
            }

            var placesToPromote = [];
            if ($rootScope.directionRequest.direction.to.placeId) {
                placesToPromote.push($rootScope.directionRequest.direction.to.placeId);
            }
            if ($rootScope.directionRequest.direction.from.placeId) {
                placesToPromote.push($rootScope.directionRequest.direction.from.placeId);
            }
            $rootScope.map.setPromotePlaces(placesToPromote);

            Analytics.trackEvent('Directions', 'DirectionsStart', '');
        };
        $scope.stopDirection = function (preventClearDirection) {
            $rootScope.map.setPromotePlaces([]);
            $rootScope.map.removeMarkers();
            $rootScope.setSelected(null);

            $scope.inDirection = false;
            if (!preventClearDirection) {
                $rootScope.directionRequest = {
                    from: {toShow: ''},
                    to: {toShow: ''},
                    direction: null
                };
            }
            $rootScope.map.stopDirections();

            if ($rootScope.isSmallScreen) {
                $rootScope.map.setBottomMargin(0);
                $rootScope.map.setTopMargin(100);
            }

            Analytics.trackEvent('Directions', 'DirectionsStop', '');
        };
        $scope.sendDirectionDemand = function (from, to) {
            var directionQuery = {
                from: from, to: to,
                options: {
                    isAccessible: $rootScope.isAccessible
                }
            };

            Analytics.trackEvent('Directions', 'DirectionsDemand', '');
            query.post('/directions', directionQuery, function (result) {
                if (_.size(result)) {
                    $scope.startDirection(result);
                    Analytics.trackEvent('Directions', 'DirectionsResult', '');
                }
                else {
                    toastr.error($scope.direction_no_result);
                    Analytics.trackEvent('Directions', 'DirectionsNotFound', 'No result found');
                }
            }, function (err) {
                console.error('sendDirectionDemand', err);
                toastr.error($scope.direction_no_result);
                Analytics.trackEvent('Directions', 'DirectionsNotFound', 'No result found (server error)');
            });

        };

        /* ---------------- */

        $scope.asideOpen = function () {
            Analytics.trackEvent('Menu', 'MenuOpen', '');
            if (urlSearch.menu !== 'false') {
                $aside.open({
                    templateUrl: 'assets/tpl/aside.view.html',
                    placement: 'left',
                    size: 'sm',
                    // animation: false,
                    controller: ['$scope', '$uibModalInstance', function ($modalScope, $uibModalInstance) {
                        $modalScope.askAccessKey = function () {
                            Analytics.trackEvent('AccessKey', 'AccessKeyOpenDialog', '');
                            $translate(['ACCESS_KEY.ENTER_KEY_POPUP.TITLE', 'ACCESS_KEY.ENTER_KEY_POPUP.SUBTITLE', 'ACCESS_KEY.ERROR_INVALID', 'ACCESS_KEY.ERROR_VALID', 'BUTTON.CANCEL', 'BUTTON.SEND'])
                                .then(function (translations) {
                                    bootbox.prompt({
                                        title: translations['ACCESS_KEY.ENTER_KEY_POPUP.TITLE'],
                                        buttons: {
                                            confirm: {label: translations['BUTTON.SEND']},
                                            cancel: {label: translations['BUTTON.CANCEL']}
                                        },
                                        callback: function (key) {
                                            if (key) {
                                                $rootScope.map.access(key, function (result) {
                                                    if (!result) {
                                                        Analytics.trackEvent('AccessKey', 'AccessKeyInvalid', '');
                                                        bootbox.alert(translations['ACCESS_KEY.ERROR_INVALID'] + ' (' + key + ')');
                                                    }
                                                    else {
                                                        toastr.success(translations['ACCESS_KEY.ERROR_VALID']);
                                                        $uibModalInstance.close();
                                                        Analytics.trackEvent('AccessKey', 'AccessKeyValid', '');
                                                    }
                                                });
                                            }
                                        }
                                    });
                                });
                        };
                    }]
                }).result.then(_.noop, _.noop);
            }
        };

        /* ---------------- */
        if (urlSearch.apiKey) {
            CONFIG.API_KEY = urlSearch.apiKey;
        }
        Mapwize.setApiKey(CONFIG.API_KEY);
        $scope.checkInitializationState();

        /* ---------------- */

        $scope.startIndoorLocationProvider = function (socketUrl, userId) {
            $scope.socketIndoorLocationProvider = new SocketIndoorLocationProvider(socketUrl, userId);
            $scope.socketIndoorLocationProvider.addListener(function (err, userIndoorLocation) {
                if (err) {
                    console.error('socketIndoorLocationProvider', err);
                }
                else {
                    $scope.map.setUserPosition(userIndoorLocation.indoorLocation);
                }
            });
            $scope.socketIndoorLocationProvider.start();
        };

    }]);
