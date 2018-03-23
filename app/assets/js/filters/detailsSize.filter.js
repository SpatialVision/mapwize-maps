'use strict';

angular.module('Mapwize').filter('limitSizeDetails', function () {
    function cutChaine(chaine, limit, suffix) {
        chaine = chaine.slice(0, limit).trim();
        return chaine + suffix;
    }
    return function (details) {
        var detailsLimit = 500;
        if (!details) {
            details = '';
        }
        return details.length > detailsLimit ? cutChaine(details, detailsLimit, '...') : details;
    };
});