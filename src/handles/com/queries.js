'use strict';

module.exports = {
  SELECT_ALL: "SELECT * FROM amazon_video_com",
  TABLE_VIDEO: "amazon_video_com",
  TABLE_VOTES: "votes_com",
  INSERT_VOTE: "INSERT INTO votes_com (movie_id, user_id, vote) VALUES ($1, $2, $3)",
  SELECT_GENRES: "SELECT DISTINCT unnest(genres) FROM amazon_video_com",
  SELECT_NUMBER: "SELECT number FROM amazon_video_com a"
};