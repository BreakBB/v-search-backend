'use strict';
const express = require('express');
const router = express.Router();

// get handles
const movieHandles = require('./handles/de/movieHandles');
const genreHandles = require('./handles/de/genreHandles');
const generalHandles = require('./handles/generalHandles');

// General routes
router.post('/login', generalHandles.handleLogin);

// DE routes
router.get('/de/movies', movieHandles.getAllMoviesDE);
router.post('/de/movies', movieHandles.getFilteredMovies);
router.get('/de/movies/estimate', movieHandles.getGlobalEstimate);
router.get('/de/movies/:number', movieHandles.getMovieByNumber);

router.get('/de/genres', genreHandles.getAllGenres);
router.get('/de/genres/:genre/numbers/:type', genreHandles.getNumbersByGenreAndType);


// EN routes
// router.get('/en/movies', handles.getAllMoviesDE);

module.exports = router;