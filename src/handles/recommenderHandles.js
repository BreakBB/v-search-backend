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
  getRecomBayes: async (req, res, voteTable, videoTable) => {
    const userId = req.header("User-Id");

    const scriptData = await generateScriptData(userId, voteTable, videoTable);

    if (typeof scriptData === "string") {
      console.log(scriptData);
      res.status(500);
      res.send(scriptData);
      return;
    }

    const pythonProcess = spawnPythonProcess("bayes");

    pythonProcess.stdout.on('data', async (data) => {
      console.log("PY: " + data);
    });

    let error = false;
    pythonProcess.stderr.on("data", (data) => {
      console.log(`stderr: ${data}`);
      error = true;
      res.status(500);
      res.json(data);
    });

    pythonProcess.on('close', async (code) => {
      console.log(`child process exited with code ${code}`);

      // An stderr appeared before so we don't need to send another response
      if (error) {
        return;
      }

      if (code === 0) {
        const predicted = JSON.parse(fs.readFileSync("../../v_commender/predicted.json", "utf-8"));

        let recomString = "{";
        for (const movie of predicted) {
          if (movie.value === 1) {
            recomString += movie.id + ",";
          }
        }
        if (recomString.endsWith(",")) {
          recomString = recomString.substring(0, recomString.length - 1);
        }
        recomString += "}";

        const recomMovies = (await db.query("SELECT * FROM " + videoTable + " WHERE movie_id = ANY (\'" + recomString + "\')")).rows;

        console.log("Found " + recomMovies.length + " recommendations");
        res.status(200);
        res.json(recomMovies);
      }
    });
  },
  getRecomNN: async (req, res, voteTable, videoTable) => {
    const userId = req.header("User-Id");

    const scriptData = await generateScriptData(userId, voteTable, videoTable);

    if (typeof scriptData === "string") {
      console.log(scriptData);
      res.status(500);
      res.send(scriptData);
      return;
    }

    const pythonProcess = spawnPythonProcess("neural");

    pythonProcess.stdout.on('data', async (data) => {
      console.log("PY: " + data);
    });

    let error = false;

    pythonProcess.stderr.on("data", (data) => {
      console.log(`stderr: ${data}`);
      error = true;
      res.status(500);
      res.json(data);
    });

    pythonProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);

      // An stderr appeared before so we don't need to send another response
      if (error) {
        return;
      }

      if (code === 0) {
        const predicted = JSON.parse(fs.readFileSync("../../v_commender/predicted.json", "utf-8"));
        res.status(200);
        res.json(predicted)
      }
      else {
        res.status(500);
        res.send("Something went wrong while predicting movies.");
      }
    });
  }
};

async function generateScriptData(userId, voteTable, videoTable) {
  const rows = await getTrainingData(userId, voteTable, videoTable);

  if (rows != null && rows.length > 0) {
    console.log("Found " + rows.length + " entries matching the requirements.");

    const movies = await getDataToPredict(userId, voteTable, videoTable);

    if (movies == null) {
      return "Error while getting movies to predict";
    }

    console.log("Found " + movies.length + " movies to predict.");

    const scriptData = {
      "voted": rows,
      "predict": movies
    };

    console.log("Saving scriptData to data.json file");
    // Save scriptData in a file, because the data is too long for script args
    fs.writeFileSync("../../v_commender/data.json", JSON.stringify(scriptData));
  }
  else {
    return "Error while finding votes matching the requirements";
  }
}

async function getTrainingData(userId, voteTable, videoTable) {
  const query = {
    text: "SELECT\n" +
    "  v.vote,\n" +
    " a.title,\n" +
    ARRAY_GENRE_IDS +
    ARRAY_ACTOR_IDS +
    ARRAY_WRITER_IDS +
    ARRAY_DIRECTOR_IDS +
    "FROM " + voteTable + " v INNER JOIN " + videoTable + " a on v.movie_id = a.movie_id\n" +
    "WHERE " + WHERE_CARDINALITY +
    " AND v.user_id = $1",
    values: [userId]
  };

  return (await db.query(query)).rows;
}

async function getDataToPredict(userId, voteTable, videoTable) {

  const query = {
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

  return (await db.query(query)).rows;
}

function spawnPythonProcess(arg) {
  console.log("Spawning python process");
  return spawn("python", ["v_commender/main.py", arg], {"cwd": "../../v_commender"});
}