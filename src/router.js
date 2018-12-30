'use strict';
const express = require('express');
const router = express.Router();

// backend routes
const handles = require('./handles/mainHandles');
// General routes
router.post('/login', handles.handleLogin);

// DE routes
router.get('/de/movies', handles.getAllMoviesDE);
router.post('/de/movies', handles.getFilteredMovies);
router.get('/de/movies/estimate', handles.getGlobalEstimate);
router.get('/de/movies/:number', handles.getMovieByNumber);
router.get('/de/genres', handles.getAllGenres);
router.get('/de/genres/:genre/numbers', handles.getNumbersByGenre);

// EN routes
// router.get('/en/movies', handles.getAllMoviesDE);

module.exports = router;