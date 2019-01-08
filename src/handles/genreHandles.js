'use strict';

const db = require("../database");

module.exports = {
  getNumbersByGenreAndType: async function (req, res, queryString, votesTable) {
    const {genre, type} = req.params;
    const userId = req.header("User-Id");

    if(genre != null && type != null && userId != null){
      const query = {
        text: queryString + ' WHERE ' +
        '(genres @> $1::varchar[]) AND ' +
        '(movie_type = $2) AND ' +
        '(NOT EXISTS (SELECT FROM ' + votesTable + ' WHERE movie_id = a.movie_id AND user_id = $3))',
        values: ['{' + genre + '}', type, userId]
      };

      const {rows} = await db.query(query);
      if(rows != null){
        let numbers = [];

        for(const row of rows){
          numbers.push(row.number);
        }

        res.status(200);
        res.json(numbers);
        return;
      }
    }
    res.status(400);
    res.send("Couldn't get numbers by the given genre");
  },
  getAllGenres: async function (req, res, queryString) {
    console.log("Searching for genres...");
    const {rows} = await db.query(queryString);

    if (rows != null) {
      console.log("Found", rows.length, "genres.");

      let genres = [];

      for (let row of rows) {
        genres.push(row.unnest)
      }

      res.status(200);
      res.json(genres);
    }
    else {
      const message = "Found no genres. Is the table empty?";
      console.error(message);
      res.status(400);
      res.send(message);
    }
  }
};