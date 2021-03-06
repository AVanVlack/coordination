'use strict';

angular.module('vanvlackCoordinationApp')
  .controller('MainCtrl', function ($scope, $http, $routeParams, $location, $window, $sce, Auth) {
    $scope.isCollapsed = true;
    $scope.listData = [];
    $scope.geolocationBtnText = "Use my location";
    $scope.working = false;
    $scope.isLoggedIn = Auth.isLoggedIn();
    $scope.tooltipText = $sce.trustAsHtml('<p>Seach for a place and we will display bars in your area. The number of people going tonight will help you find the most popular place. Sign in and add yourself to the going.</p>')
    //gets geolocation from browser/sensor and calls getNearby

    $scope.getLocation = function() {
      $scope.listData = [];
      $scope.working = true;
      $scope.geolocationBtnText = "Getting Location..."
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
          $scope.geolocationBtnText = "Use my location";
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
      $scope.listData = [];
      $scope.working = true;
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
        $scope.working = false;
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
      var offset = new Date().getTimezoneOffset() / 60;
      offset *= -1;
      $http.post('/api/places/', {placeID: placeID, timeOffset: offset,}).then(function(res){
        switch (res.status){
          case 201:
            console.log(res);
            $scope.listData[index].going += 1;
            break;
          case 204:
            console.log(res);
            $scope.listData[index].going -= 1;
            break;
        }
      })
    };

    //login
    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider + $location.url();
    };

    //logout
    $scope.logout = function() {
      Auth.logout();
      $scope.isLoggedIn = Auth.isLoggedIn();
    };

    //grab more info and display collapsed info
    $scope.moreInfo = function(index, id, isCollapsed){
      if(!$scope.listData[index].moreInfo){
        $scope.listData[index].moreInfo = 1;
        $scope.getDetails(id, function(data){
          $scope.listData[index].moreInfo = data.result;
          console.log($scope.listData[index]);
          return false;
        });
      }else{
          return !isCollapsed;
      };
    };

    //Get list if params in url. eg. twtitter callback.
    if($routeParams.lat != null & $routeParams.lng != null){
      $scope.getNearby($routeParams);
    }
  })
