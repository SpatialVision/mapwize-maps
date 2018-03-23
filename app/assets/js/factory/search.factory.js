/* global _, async */

'use strict';

angular.module('Mapwize').factory('search', ['query', '$timeout', 'Analytics', 'CONFIG', function (query, $timeout, Analytics, CONFIG) {
    var lastSended = null;

    function searchInMapwize(search, options, callback) {
        query.post('/search', {
            query: search,
            venueId: options.venueId,
            universeId: options.universeId,
            objectClass: options.objectClass,
            organizationId: options.organizationId,
            queryParams: {
                //aroundLatLng: mapCenter.lat + ',' + mapCenter.lng
            }
        }, function (searchResult) {
            callback(null, searchResult.hits);
        }, function (err) {
            callback(err, []);
        });
    }
    function searchInGoogle(search, options, callback) {
        query.queryOut('https://maps.googleapis.com/maps/api/geocode/json', 'GET', {
            address: search,
            key: CONFIG.GOOGLE_API_KEY,
            bounds: options.bounds._southWest.lat + ',' + options.bounds._southWest.lng + '|' + options.bounds._northEast.lat + ',' + options.bounds._northEast.lng
        }, {}, function (result) {
            callback(null, result.results);
        }, function (err) {
            callback(err, []);
        });
    }

    var search = _.debounce(function (searchQuery, options, callback) {
        lastSended = searchQuery;

        if (!searchQuery) {
            return callback(null, {searchQuery: '', mapwize: [], google: []});
        }

        async.parallel({
            searchQuery: function (callback) {
                callback(null, searchQuery);
            },
            mapwize: function (callback) {
                searchInMapwize(searchQuery, options, callback);
            },
            google: function (callback) {
                if (options.google) {
                    searchInGoogle(searchQuery, options, callback);
                }
                else {
                    callback(null, []);
                }
            }
        }, function (err, results) {
            if (err) {
                callback(err);
            }
            else {
                if (lastSended === searchQuery) {
                    callback(null, results);
                }
            }
        });
        Analytics.trackEvent('search', 'searchQuery', searchQuery);
    }, 250, {'maxWait': 500});

    return function (searchQuery, options, callback) {
        search(searchQuery, options, callback);
    };
}]);
