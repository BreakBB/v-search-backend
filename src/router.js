'use strict';
const express = require('express');
const router = express.Router();

// backend routes
const handles = require('./handles/mainHandles');
// DE routes
router.get('/de/movies', handles.getAllMoviesDE);
router.post('/de/movies', handles.getFilteredMoviesDE);

// EN routes
// router.get('/en/movies', handles.getAllMoviesDE);

module.exports = router;