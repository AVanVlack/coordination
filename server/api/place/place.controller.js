'use strict';

var _ = require('lodash');
var Place = require('./place.model');
var config = require('../../config/environment');
var https = require("https");
var moment = require("moment")
moment().format();

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
  var options = {
    hostname: 'maps.googleapis.com',
    port: 443,
    path: '/maps/api/place/nearbysearch/json?location='+req.query.lat+','+req.query.lng+'&radius=500&types=bar&key=' + config.google.clientID,
    method: 'GET'
  };


  var googlePlace = https.get(options, function(data) {
    var raw = '';
    var body = [];
    data.on('data', function (chunk) {
      raw += chunk;
    });
    data.on('end', function () {
      raw = JSON.parse(raw).results;
      raw.forEach(function(item, index){
        var aPlace = item;
        //query a count of people for each place
        Place.count({placeID: aPlace.place_id}, function(err, count){
          aPlace.going = count;
          body.push(aPlace);
          //flow control: send and end on last db entry
          if(index === raw.length -1){
            res.end(JSON.stringify(body));
          }
        });
      });
    })
  })
  googlePlace.end()
  googlePlace.on('error', function(e){
    console.error(e);
  });

}
//places autocomplet for search
exports.lookup = function(req, res) {
  var options = {
    hostname: 'maps.googleapis.com',
    port: 443,
    path: '/maps/api/place/autocomplete/json?input=' + req.params.search + '&types=geocode&language=en&key=' + config.google.clientID,
    method: 'GET'
  };
  console.log(options);


  var places = https.request(options, function(data) {
    console.log(data);
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


// Create or remove a new place in the DB.
exports.create = function(req, res) {
  var query = Place.where({'placeID': req.body.placeID}, {'userID': req.user._ID}).exec(function(err, place){
    if(place.length === 0){
      var newPlace = req.body;
      newPlace.userID = req.user._id;
      var ttl = moment().utcOffset(req.body.timeOffset).endOf('day').add(3,'hours');
      ttl.utc()
      newPlace.expireAt = ttl.toDate();
      Place.create(newPlace, function(err, place) {
        if(err) { return handleError(res, err); }
        return res.status(201).json(place);
      });
    }else{
    //user has already voted place, remove entry
      place[0].remove(function(err) {
        if(err) { return handleError(res, err); }
        return res.status(204).send('No Content');

      });
    }
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
