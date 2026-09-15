const express = require('express');
const { RACES, CLASSES, DESTINIES } = require('../data/gameData');
const { LOCATIONS } = require('../data/locations');
const { ITEMS, EQUIPMENT } = require('../data/items');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ races: RACES, classes: CLASSES, destinies: DESTINIES, locations: LOCATIONS, items: ITEMS, equipment: EQUIPMENT });
});

module.exports = router;
