'use strict';

angular.module('Mapwize').controller('MenuVenueCtrl', ['$scope', '$rootScope', '$document', function ($scope, $rootScope) {

    $scope.mainPlaceClicked = function (elem) {
        $rootScope.map.setFollowUserMode(false);
        $rootScope.setSelected(elem);
        if (elem.objectClass == 'place') {
            $rootScope.map.centerOnPlace(elem);
        }
        else {
            $rootScope.map.centerOnVenue(elem.venue._id)
        }

        $rootScope.hideMenuVenue();
    };

}]);