'use strict';

angular.module('vanvlackCoordinationApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.listData = [];
    //gets geolocation from browser/sensor and calls getNearby
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
    //returns list for search input
    $scope.autocomplete = function(term) {
      return $http.get('/api/places/lookup/' + term).then(function(data){
        return data.data.predictions.map(function(item){
          return {name: item.description, placeID: item.place_id};
        })
      })
    };
    //on select get details then call list with lat/long
    $scope.onSelectAutocomplete = function($item, $model, $label){
      $scope.getDetails($item.placeID, function(data){
        $scope.getNearby(data.result.geometry.location);
      })
    };
    //get and return details
    $scope.getDetails = function(placeID, done){
      $http.get('/api/places/details/' + placeID).success(function(data){
        console.log(data);
        done(data)
      });
    }
    //get nearby list and update model
    $scope.getNearby = function(location){
      $http.get('/api/places/list?lat=' + location.lat + '&lng=' + location.lng).success(function(data){
        $scope.listData = data;
        console.log(data);
      }).error(function(error){
        console.log("some kind of problem with geolocation api")
      });
    }
    //post as going to place
    $scope.postAsGoing = function(placeID){
      var offset = new Date().getTimezoneOffset() / 60;
      $http.post('/api/places/', {placeID: placeID, timeOffset: offset,}).then(function(res){
        console.log(res);
      })
    }
  });
