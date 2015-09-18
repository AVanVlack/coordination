'use strict';

angular.module('vanvlackCoordinationApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.listData = [];

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.getLocation = function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
          $http.get('/api/places/list?lat=' + position.coords.latitude + '&lng=' + position.coords.longitude).success(function(data){
            console.log("got me some data");
            console.log(data);
            $scope.listData = data;
          }).error(function(error){
            console.log("some kind of problem with geolocation api")
          });
        });
      } else {
        // no native support; maybe try a fallback?
      }
    };
  });
