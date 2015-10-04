'use strict';

var _ = require('lodash');
var Place = require('./place.model');
var config = require('../../config/environment');
var https = require("https");

// Get list of people going
exports.index = function(req, res) {
  Place.find(function (err, places) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(places);
  });
};

// Get a single place
exports.show = function(req, res) {
  Place.findById(req.params.id, function (err, place) {
    if(err) { return handleError(res, err); }
    if(!place) { return res.status(404).send('Not Found'); }
    return res.json(place);
  });
};

// Get a list of places to go and the number of people going
exports.places = function(req, res) {
  console.log(req.query.lat)
  console.log(req.query.lng)
  var options = {
    hostname: 'maps.googleapis.com',
    port: 443,
    path: '/maps/api/place/nearbysearch/json?location='+req.query.lat+','+req.query.lng+'&radius=500&types=bar&key=' + config.google.clientID,
    method: 'GET'
  };
  console.log(options.path)

  var places = https.get(options, function(data) {
    console.log('STATUS: ' + data.statusCode);
    console.log("headers: ", data.headers);
    var output = {};
    data.on('data', function (chunk) {
      res.write(chunk);
    });
    data.on('end', function () {
      console.log(output)
      res.end()
    })
  })
  places.end()
  places.on('error', function(e){
    console.error(e);
  });

}
//places autocomplet for search
exports.lookup = function(req, res) {
  console.log(req.params.search)
  var options = {
    hostname: 'maps.googleapis.com',
    port: 443,
    path: '/maps/api/place/autocomplete/json?input=' + req.params.search + '&types=geocode&language=en&key=' + config.google.clientID,
    method: 'GET'
  };

  var places = https.request(options, function(data) {
    console.log('STATUS: ' + data.statusCode);
    console.log('HEADERS: ' + JSON.stringify(data.headers));
    var output = {};
    data.on('data', function (chunk) {
      res.write(chunk);
    });
    data.on('end', function () {
      console.log(output)
      res.end()
    })
  })
  places.end()
  places.on('error', function(e){
    console.error(e);
  });
}

// Get the details of a place.
exports.details = function(req, res) {
  var options = {
    hostname: 'maps.googleapis.com',
    port: 443,
    path: '/maps/api/place/details/json?placeid=' + req.params.placeId + '&key=' + config.google.clientID,
    method: 'GET'
  };

  var places = https.get(options, function(data) {
    console.log('STATUS: ' + data.statusCode);
    console.log("headers: ", data.headers);
    var output = {};
    data.on('data', function (chunk) {
      res.write(chunk);
    });
    data.on('end', function () {
      console.log(output)
      res.end()
    })
  })
  places.end()
  places.on('error', function(e){
    console.error(e);
  });

}


// Creates a new place in the DB.
exports.create = function(req, res) {
  var newPlace = req.body;
  newPlace.userID = req.user._id;
  Place.create(newPlace, function(err, place) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(place);
  });
};

// Updates an existing place in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Place.findById(req.params.id, function (err, place) {
    if (err) { return handleError(res, err); }
    if(!place) { return res.status(404).send('Not Found'); }
    var updated = _.merge(place, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(place);
    });
  });
};

// Deletes a place from the DB.
exports.destroy = function(req, res) {
  Place.findById(req.params.id, function (err, place) {
    if(err) { return handleError(res, err); }
    if(!place) { return res.status(404).send('Not Found'); }
    place.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
