'use strict';

const db = require("../../database");

module.exports = {
  getAllMoviesDE: async function (req, res) {
    console.log("Searching for movies...");
    const {rows} = await db.query('SELECT * FROM amazon_video_de', null);

    if (rows != null) {
      console.log("Found", rows.length, "entries.");
      res.status(200);
      res.json(rows);
    }
    else {
      const message = "Found no entries in the DB.";
      console.error(message);
      res.status(400);
      res.send(message)
    }
  },
  getGlobalEstimate: async function (req, res) {
    console.log("Estimating entry amount...");
    // This will get an estimate of the real amount of rows in the table
    // This is a lot faster on big tables than count(*)
    const {rows} = await db.query(
      'SELECT reltuples::bigint as estimate from pg_class where relname=\'amazon_video_de\''
      , null
    );

    if (rows != null) {
      const estimate = rows[0].estimate;
      console.log("Estimated", estimate, "entries.");
      res.status(200);
      res.json(estimate);
    }
    else {
      const message = "Found no entries in the DB.";
      console.error(message);
      res.status(400);
      res.send(message)
    }
  },
  getMovieByNumber: async function (req, res) {
    const movie_number = req.params.number;

    if (movie_number != null) {
      const query = {
        text: "SELECT * FROM amazon_video_de WHERE number = $1",
        values: [movie_number]
      };

      const {rows} = await db.query(query);

      if (rows != null) {
        res.status(200);
        res.json(rows[0]);
        return;
      }
    }
    res.status(400);
    res.send("Couldn't get movie by number");
  },
  getFilteredMovies: async function (req, res) {
    const filter = buildFilter(req.body);

    const query = {
      text: 'SELECT * FROM amazon_video_de' +
      ' WHERE ($1 OR LOWER(title) LIKE LOWER($2))' +
      ' AND ($3 OR rating >= $4)' +
      ' AND ($5 OR imdb >= $6)' +
      ' AND ($7 OR genres @> $8::varchar[])' +
      ' AND ($9 OR year = $10)' +
      ' AND ($11 OR fsk <= $12)' +
      ' AND ($13 OR movie_type = $14 OR movie_type = \'\')',
      values: filter
    };

    console.log("QUERY: ", query.values.reduce((q, v, i) => q.replace(`$${i + 1}`, v), query.text));

    console.log("Searching for movies...");
    const {rows} = await db.query(query);

    if (rows != null) {
      console.log("Found", rows.length, "entries.");
      res.status(200);
      res.json(rows);
    }
    else {
      const message = "Found no entries matching the filter.";
      console.error(message);
      res.status(400);
      res.send(message)
    }
  }
};

function buildFilter(b) {
  console.log("Got body: ", b);
  let filter = [];

  const TRUE = "TRUE";
  const FALSE = "FALSE";
  const NULL = "NULL";

  if (b.title == null) {
    filter.push(TRUE, NULL);
  }
  else {
    const stopWords = b.title.split(' ');
    let titleString = "";
    for (const word of stopWords) {
      titleString = titleString + "%" + word + "%";
    }

    filter.push(FALSE, titleString);
  }

  if (b.rating == null) {
    filter.push(TRUE, 0);
  }
  else {
    filter.push(FALSE, b.rating);
  }

  if (b.imdb == null) {
    filter.push(TRUE, 0);
  }
  else {
    filter.push(FALSE, b.imdb);
  }

  if (b.genres == null) {
    filter.push(TRUE, "{}");
  }
  else {
    filter.push(FALSE, b.genres);
  }

  if (b.year == null) {
    filter.push(TRUE, 0);
  }
  else {
    filter.push(FALSE, b.year);
  }

  if (b.fsk == null) {
    filter.push(TRUE, 0);
  }
  else {
    filter.push(FALSE, b.fsk);
  }

  if (b.movies && b.series) {
    filter.push(TRUE, NULL); // Use true to find all types
  }
  else if (b.movies) {
    filter.push(FALSE, "Film");
  }
  else {
    filter.push(FALSE, "Serie");
  }
  return filter;
}