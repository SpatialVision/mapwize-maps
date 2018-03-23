/* global _ */

'use strict';

angular.module('Mapwize').factory('query', ['$http', 'CONFIG', function ($http, CONFIG) {
    function queryOut(url, method, params, data, success, error) {
        return $http({
            method: method,
            url: url,
            params: params,
            data: data
        }).then(function (response) {
            if (success) {
                success(response.data);
            }
        }, error);
    }

    function query(url, method, params, data, success, error) {
        params.api_key = CONFIG.API_KEY;

        return $http({
            method: method,
            url: CONFIG.SERVER_URL + '/v1' + url,
            params: params,
            data: data,
            withCredentials: true
        }).then(function (response) {
            if (success) {
                success(response.data);
            }
        }, function (err) {
            if (error) {
                error(err);
            }
        });
    }

    function getQuery(url, params, success, error) {
        return query(url, 'GET', params, {}, success, error);
    }
    function deleteQuery(url, params, success, error) {
        return query(url, 'DELETE', params, {}, success, error);
    }

    function postQuery(url, data, success, error) {
        return query(url, 'POST', {}, data, success, error);
    }
    function putQuery(url, data, success, error) {
        return query(url, 'PUT', {}, data, success, error);
    }

    var queryObject = {
        get: getQuery,
        post: postQuery,
        put: putQuery,
        delete: deleteQuery,
        query: query,
        queryOut: queryOut
    };

    return queryObject;
}]);
