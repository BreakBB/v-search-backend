'use strict';
const express = require('express');
const router = express.Router();

// get handles
const movieHandles = require('./handles/movieHandles');
const genreHandles = require('./handles/genreHandles');
const voteHandles = require('./handles/voteHandles');
const generalHandles = require('./handles/generalHandles');
const recommenderHandles = require('./handles/recommenderHandles');

const deQueries = require('./handles/de/queries');
const comQueries = require('./handles/com/queries');

// General routes
router.post('/login', (req, res) => generalHandles.handleLogin(req, res));

// DE routes
router.get('/de/movies', (req, res) => movieHandles.getAllMovies(req, res, deQueries.SELECT_ALL));
router.post('/de/movies', (req, res) => movieHandles.getFilteredMovies(req, res, deQueries.SELECT_ALL));
router.get('/de/movies/estimate', (req, res) => movieHandles.getGlobalEstimate(req, res, deQueries.TABLE_VIDEO));
router.get('/de/movies/:number', (req, res) => movieHandles.getMovieByNumber(req, res, deQueries.SELECT_ALL));

router.post('/de/movies/vote-up', (req, res) => voteHandles.handleVote(req, res, deQueries.INSERT_VOTE, true));
router.post('/de/movies/vote-down', (req, res) => voteHandles.handleVote(req, res, deQueries.INSERT_VOTE, false));

router.get('/de/genres', (req, res) => genreHandles.getAllGenres(req, res, deQueries.SELECT_GENRES));
router.get('/de/genres/:genre/numbers/:type', (req, res) => genreHandles.getNumbersByGenreAndType(req, res, deQueries.SELECT_NUMBER, deQueries.TABLE_VOTES));

router.get('/de/recommender', (req, res) => recommenderHandles.handleGeneralUpdate(req, res));


// COM routes
router.get('/com/movies', (req, res) => movieHandles.getAllMovies(req, res, comQueries.SELECT_ALL));
router.post('/com/movies', (req, res) => movieHandles.getFilteredMovies(req, res, comQueries.SELECT_ALL));
router.get('/com/movies/estimate', (req, res) => movieHandles.getGlobalEstimate(req, res, comQueries.TABLE_VIDEO));
router.get('/com/movies/:number', (req, res) => movieHandles.getMovieByNumber(req, res, comQueries.SELECT_ALL));

router.post('/com/movies/vote-up', (req, res) => voteHandles.handleVote(req, res, comQueries.INSERT_VOTE, true));
router.post('/com/movies/vote-down', (req, res) => voteHandles.handleVote(req, res, comQueries.INSERT_VOTE, false));

router.get('/com/genres', (req, res) => genreHandles.getAllGenres(req, res, comQueries.SELECT_GENRES));
router.get('/com/genres/:genre/numbers/:type', (req, res) => genreHandles.getNumbersByGenreAndType(req, res, comQueries.SELECT_NUMBER, comQueries.TABLE_VOTES));

module.exports = router;