'use strict';

var express = require('express');
var controller = require('./place.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/list/', controller.places) //list locations from placeID or lng lat
router.get('/lookup/:search', controller.lookup) //autocomplte
router.get('/details/:placeId', controller.details) //get details
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
