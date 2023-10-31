import http from 'k6/http';
import { check, fail, group } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';


const deleteIndex = function(config = fail(`missing config.`)) {
  const { host, index } = config.elasticsearch

  group(`Delete index ${index}`, function () {
    let res = http.get(`${host}/${index}`);

    if (res.status === 200) {
      // delete index movies
      res = http.del(`${host}/${index}`);
    
      // check that index is deleted
      check(res, {
        'status was 200': (r) => r.status === 200,
        'Response message 200 OK': (r) => r.status_text == '200 OK'
      });
    }
  })
}


const saveMovies = function(config = fail(`missing config.`), movies = fail(`missing movies.`)) {
  const { host, index } = config.elasticsearch

  group(`Save movies to Elasticsearch`, function () {
    for (let movie of movies) {
      let res = http.post(`${host}/${index}/_doc/${uuidv4()}`, JSON.stringify(movie), { headers: { 'Content-Type': 'application/json' } });

      check(res, {
        'status was 201': (r) => r.status === 201,
        'Response message 201 Created': (r) => r.status_text == '201 Created'
      });
    }
  })
}

const existMovies = function(config = fail(`missing config.`), exactlyCount = fail(`missing exactlyCount.`)) {
  const { host } = config.elasticsearch

  group(`Exist ${exactlyCount} movies in Elasticsearch`, function () {
    let res = http.get(`${host}/_cat/indices?format=json&pretty=true`);
    check(res, {
      'status was 200': (r) => r.status === 200,
      'index movies contains four records': (r) => r.json()[0]['docs.count'] === `${exactlyCount}`,
    });
  });
}


module.exports = {
  saveMovies,
  deleteIndex,
  existMovies
}