'use strict';

angular.module('Mapwize').controller('AppController', ['$scope', '$rootScope', '$window', 'localStorageService', '$translate', function ($scope, $rootScope, $window, localStorageService, $translate) {
    $rootScope.isMobile = L.Browser.mobile;
    $rootScope.isTouch = L.Browser.touch;

    $rootScope.isSmallScreen = false;

    $rootScope.loadingEnded = false;

    $scope.$watch(function () {
        return $window.innerWidth;
    }, function (width) {
        $rootScope.isSmallScreen = width <= 767;
    });

    $rootScope.debug = function (t) {
        console.log(t);
    };

    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && angular.isFunction(fn)) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };
    $rootScope.safeApply = $scope.safeApply;

    /* ---------------- */

    $rootScope.isAccessible = !!localStorageService.get('isAccessible');

    $rootScope.toggleIsAccessible = function () {
        $rootScope.isAccessible = !$rootScope.isAccessible;
    };

    $scope.$watch('isAccessible', function (isAccessible) {
        localStorageService.set('isAccessible', isAccessible);
    }, true);

    /* ---------------- */

    $rootScope.appLanguage = localStorageService.get('appLanguage') || navigator.language || navigator.userLanguage || 'en';

    $rootScope.setAppLanguage = function (language) {
        $rootScope.appLanguage = language;
    };

    $scope.$watch('appLanguage', function (language) {
        $translate.use(language).then(function () {
            localStorageService.set('appLanguage', language);
        });
    }, true);

    /* ---------------- */

    $rootScope.appUnit = localStorageService.get('appUnit') || (/^en/.test($rootScope.appLanguage) ? 'ft' : 'm');

    $rootScope.setAppUnit = function (unit) {
        $rootScope.appUnit = unit;
    };

    $scope.$watch('appUnit', function (unit) {
        localStorageService.set('appUnit', unit);
    }, true);

}]);