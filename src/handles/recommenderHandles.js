'use strict';

const db = require("../database");
const WHERE_CARDINALITY = require("./com/queries").WHERE_CARDINALITY;
const ARRAY_DIRECTOR_IDS = require("./com/queries").ARRAY_DIRECTOR_IDS;
const ARRAY_WRITER_IDS = require("./com/queries").ARRAY_WRITER_IDS;
const ARRAY_ACTOR_IDS = require("./com/queries").ARRAY_ACTOR_IDS;
const ARRAY_GENRE_IDS = require("./com/queries").ARRAY_GENRE_IDS;
const spawn = require('child_process').spawn;
const fs = require("fs");

module.exports = {
  getRecommendations: async (req, res, voteTable, videoTable) => {
    const userId = req.header("User-Id");

    const training_query = {
      text: "SELECT\n" +
      "  v.vote,\n" +
      ARRAY_GENRE_IDS +
      ARRAY_ACTOR_IDS +
      ARRAY_WRITER_IDS +
      ARRAY_DIRECTOR_IDS +
      "FROM " + voteTable + " v INNER JOIN " + videoTable + " a on v.movie_id = a.movie_id\n" +
      "WHERE " + WHERE_CARDINALITY +
      " AND v.user_id = $1",
      values: [userId]
    };

    const {rows} = await db.query(training_query);

    if (rows != null && rows.length > 0) {
      console.log("Found " + rows.length + " entries matching the requirements.");

      const predict_query = {
        text: "SELECT\n" +
        "  a.movie_id,\n" +
        ARRAY_GENRE_IDS +
        ARRAY_ACTOR_IDS +
        ARRAY_WRITER_IDS +
        ARRAY_DIRECTOR_IDS +
        "FROM " + videoTable + " a\n" +
        "WHERE NOT exists(SELECT\n" +
        "                 FROM " + voteTable + " v\n" +
        "                 WHERE v.movie_id = a.movie_id AND v.user_id = $1) AND\n" +
        WHERE_CARDINALITY,
        values: [userId]
      };

      const movies = (await db.query(predict_query)).rows;

      console.log("Predicted " + movies.length + " movies");

      const scriptData = {
        "voted": rows,
        "predict": movies
      };

      // Save scriptData in a file, because the data is too long for script args
      fs.writeFileSync("../../v_commender/data.json", JSON.stringify(scriptData));

      console.log("Spawning python process");
      const pythonProcess = spawn("py", ["v_commender/main.py"], {"cwd": "../../v_commender"});

      pythonProcess.stdout.on('data', async (data) => {
        const json = JSON.parse(data.toString());
        console.log("Predicted: ", json);

        let i = 0;
        let recom_string = "";
        for (const movie of movies) {
          if (json[i]) {
            recom_string += movie.movie_id + ",";
          }
          i++;
        }
        if (recom_string.endsWith(",")) {
          recom_string = recom_string.substring(0, recom_string.length - 1);
        }

        const recomMovies = (await db.query("SELECT * FROM " + videoTable + " WHERE movie_id = ANY (\'{" + recom_string + "}\')")).rows;

        console.log("Found " + recomMovies.length + " recommendations");

        res.status(200);
        res.json(recomMovies);
      });

      pythonProcess.stderr.on("data", (data) => {
        console.log(`stderr: ${data}`);
        res.status(500);
        res.json(data);
      });

      pythonProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
      });
    }
    else {
      const message = "Error while finding votes matching the requirements";
      console.log(message);
      res.status(500);
      res.send(message);
    }
  }
};