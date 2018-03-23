// toastr config
angular.module('Mapwize').config(['toastrConfig', function (toastrConfig) {
    angular.extend(toastrConfig, {
        autoDismiss: true,
        progressBar: true,
        closeButton: true
    });
}]);

// Translate config
angular.module('Mapwize').config(['$translateProvider', function ($translateProvider) {

    $translateProvider.useStaticFilesLoader({
        prefix: 'assets/resources/lang/',
        suffix: '.json'
    });
    $translateProvider.useSanitizeValueStrategy(null); // See https://github.com/angular-translate/angular-translate/issues/1282
    $translateProvider
        .registerAvailableLanguageKeys(['en', 'fr', 'de', 'nl'], {
            'en_*': 'en',
            'fr_*': 'fr',
            'de_*': 'de',
            'nl_*': 'nl',
            '*': 'en'
        })
        .determinePreferredLanguage();

}]);

/* Setup Rounting For All Pages */
angular.module('Mapwize').config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function ($locationProvider, $stateProvider, $urlRouterProvider) {

    $locationProvider.hashPrefix('');

    // Redirect any unmatched url
    $urlRouterProvider.otherwise('/');

    $stateProvider.state('mapwize', {
        url: '/',
        templateUrl: 'assets/tpl/map.view.html',
        controller: 'MapController'
    }).state('mapwize.code', {
        url: ':code'
    }).state('mapwize.beacon', {
        url: 'b/:venueAlias/:beaconAlias'
    }).state('mapwize.centerOnVenueAlias', {
        url: 'v/:venueAlias'
    }).state('mapwize.centerOnVenueAliasFloor', {
        url: 'v/:venueAlias/:floor'
    }).state('mapwize.centerOnPlaceAlias', {
        url: 'p/:venueAlias/:placeAlias'
    }).state('mapwize.centerOnCoordinates', {
        url: 'c/:latitude/:longitude'
    }).state('mapwize.centerOnCoordinatesFloor', {
        url: 'c/:latitude/:longitude/:floor'
    });

    // Direction states
    $stateProvider.state('mapwize.fromCodeToPlaceAlias', {
        url: 'f/:code/t/p/:venueAlias/:placeAlias'
    }).state('mapwize.fromBeaconToPlaceAlias', {
        url: 'f/b/:venueAliasFrom/:beaconAliasFrom/t/p/:venueAliasTo/:placeAliasTo'
    }).state('mapwize.fromPlaceAliasToPlaceAlias', {
        url: 'f/p/:venueAliasFrom/:placeAliasFrom/t/p/:venueAliasTo/:placeAliasTo'
    }).state('mapwize.fromCoordinatesToPlaceAlias', {
        url: 'f/c/:latitude/:longitude/:floor/t/p/:venueAlias/:placeAlias'
    });

}]);

angular.module('Mapwize').config(['$sceDelegateProvider', function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self'
    ]);
}]);

angular.module('Mapwize').config(['AnalyticsProvider', 'CONFIG', function (AnalyticsProvider, CONFIG) {
    // Add configuration code as desired
    if (CONFIG.MAPS_GA && CONFIG.MAPS_GA !== 'null') {
        AnalyticsProvider.setAccount(CONFIG.MAPS_GA);
        AnalyticsProvider.setPageEvent('$stateChangeSuccess');
    }
    else {
        AnalyticsProvider.setAccount('');
    }
}]);

/* Init global settings and run the app */
angular.module('Mapwize').run(['$rootScope', '$state', 'APP', 'CONFIG', function ($rootScope, $state, APP, CONFIG) {
    $rootScope.$state = $state; // state to be accessed from view

    $rootScope.APP = APP;
    $rootScope.CONFIG = CONFIG;

    Mapwize.config.SERVER = CONFIG.SERVER_URL;
    Mapwize.config.analyticsId = CONFIG.SDK_GA;
    Mapwize.config.CLIENT_APP_NAME = 'Mapwize maps ' + CONFIG.ENV;

}]);
