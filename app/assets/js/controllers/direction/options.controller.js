'use strict';

angular.module('Mapwize').controller('OptionsCtrl', ['$rootScope', '$scope', function ($rootScope, $scope) {

    $scope.reverse = function () {
        $rootScope.$broadcast('reverseDirection');
    };

}]);