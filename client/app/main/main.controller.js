'use strict';

angular.module('vanvlackCoordinationApp')
  .controller('MainCtrl', function ($scope, $http, $routeParams, $location, $window) {
    $scope.listData = [];
    //gets geolocation from browser/sensor and calls getNearby

    $scope.getLocation = function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
          $scope.getNearby({lat: position.coords.latitude, lng: position.coords.longitude});
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
        //upate url with new location.
        $location.search('lat', location.lat);
        $location.search('lng', location.lng);
        console.log(data);
      }).error(function(error){
        console.log("some kind of problem with geolocation api")
      });
    }
    //post as going to place
    $scope.postAsGoing = function(placeID, index){
      $scope.listData[index].going += 1;
      var offset = new Date().getTimezoneOffset() / 60;
      offset *= -1;
      $http.post('/api/places/', {placeID: placeID, timeOffset: offset,}).then(function(res){
        console.log(res);
      })
    }
    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };

    //Get list if params in url. eg. twtitter callback.
    if($routeParams.lat != null & $routeParams.lng != null){
      $scope.getNearby($routeParams);
    }
  });
