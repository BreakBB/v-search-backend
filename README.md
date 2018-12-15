# v-search-backend

This project is the backend the [v-search](https://github.com/BreakBB/v-search) project and handles DB calls.

## Supported endpoints

### GET /api/de/movies

returns all movies in the DB.

### POST /api/de/movies

Parameter:

Any combination of the following:

```{"title": "<movieTitle>"}``` **[type: string]** returns results matching the given title.

```{"rating": <movieRating>}``` **[type: number]** returns results which have at least the given rating.

```{"imdb": <movieIMDbRating>}``` **[type: number]** returns results which have at least the given IMDb-rating.

```{"genres": ["<movieGenre/s>"]}``` **[type: string[]]** returns results matching the given genre/s

```{"year": "<movieYear>"}``` **[type: number]** returns results matching the given year

```{"fsk": "<movieFSK>"}``` **[type: number]** returns results have the given FSK rating or less.


## Requirements

A "database.ini" file inside ```/src``` with the following schema:

    ```ini
    [postgresql]
    host=<hostAdress>
    port=<hostPort>
    dbname=<databaseName>
    user=<username>
    password=<password>
    ```