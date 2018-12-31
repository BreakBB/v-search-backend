'use strict';

const db = require("../database");
const bcrypt = require("bcrypt");

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
  getNumbersByGenreAndType: async function (req, res) {
    const {genre, type} = req.params;

    let movie_type = type === "movies" ? "Film" : "Serie";

    if(genre != null && type != null){
      const query = {
        text: 'SELECT number FROM amazon_video_de WHERE (genres @> $1::varchar[]) AND (movie_type = $2)',
        values: ['{' + genre + '}', movie_type]
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
  },
  getAllGenres: async function (req, res) {
    console.log("Searching for genres...");
    const {rows} = await db.query('SELECT DISTINCT unnest(genres) FROM amazon_video_de', null);

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
      const message = "Found no genres in the DB. Is the DB empty?";
      console.error(message);
      res.status(400);
      res.send(message);
    }
  },
  handleLogin: async function (req, res) {
    const {userName, password} = req.body;

    if (userName === undefined || password === undefined) {
      const message = "userName or password is undefined.";
      res.status(400);
      res.send(message);
    }

    const query = {
      text: "SELECT password FROM users WHERE name = $1",
      values: [userName]
    };

    const {rows} = await db.query(query);

    // UserName exists
    if (rows != null && rows.length === 1) {
      // Compare stored hash with password
      if (bcrypt.compareSync(password, rows[0].password)) {
        res.status(200);
        res.send("Login successful");
        return;
      }
    }
    res.status(400);
    res.send("Login failed");
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