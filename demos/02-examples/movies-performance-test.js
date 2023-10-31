/**
 * Marvel Movies Home Work
 * 
 * How to run
 * k6 run demos/02-examples/movies-performance-test.js
 * 
 */
import http from 'k6/http';
import { check } from 'k6';

// import library for pause between requests
import { sleep } from 'k6';

// import library for generate unique id
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// create setup function which delete index movies from elasticsearch and check that index is deleted
export function setup() {
  // exist index movies
  let res = http.get('http://localhost:9200/movie');
  /**
   * {"status":404,"error":{"root_cause":[{"index_uuid":"_na_","index":"movie","type":"index_not_found_exception","reason":"no such index [movie]","resource.type":"index_or_alias","resource.id":"movie"}],"type":"index_not_found_exception","reason":"no such index [movie]","resource.type":"index_or_alias","resource.id":"movie","index_uuid":"_na_","index":"movie"}}
   */
  if (res.json().status !== 200) {
    // delete index movies
    res = http.del('http://localhost:9200/movies');
  
    // check that index is deleted
    check(res, {
      'status was 200': (r) => r.status === 200,
      'Response message 200 OK': (r) => r.status_text == '200 OK'
    });
  }
}


export default function () {
  let documents = [
    {
      title: 'Iron Man',
      release_date: '2008-05-02',
      actors: ['Robert Downey Jr.', 'Gwyneth Paltrow', 'Terrence Howard'],
      description: 'After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil.',
      rating: 7.9,
    },
    {
      title: 'The Incredible Hulk',
      release_date: '2008-06-13',
      actors: ['Edward Norton', 'Liv Tyler', 'Tim Roth'],
      description: 'Bruce Banner, a scientist on the run from the U.S. Government, must find a cure for the monster he turns into whenever he loses his temper.',
      rating: 6.7,
    },
    {
      title: 'Thor',
      release_date: '2011-05-06',
      actors: ['Chris Hemsworth', 'Anthony Hopkins', 'Natalie Portman'],
      description: 'The powerful but arrogant god Thor is cast out of Asgard to live amongst humans in Midgard (Earth), where he soon becomes one of their finest defenders.',
      rating: 7.0,
    },
    {
      title: 'Captain America: The First Avenger',
      release_date: '2011-07-22',
      actors: ['Chris Evans', 'Hugo Weaving', 'Samuel L. Jackson'],
      description: 'Steve Rogers, a rejected military soldier, transforms into Captain America after taking a dose of a "Super-Soldier serum". But being Captain America comes at a price as he attempts to take down a war monger and a terrorist organization.',
      rating: 6.9,
    },
  ];

  // Odeslání dokumentů ve smyčce
  for (let document of documents) {
    let res = http.post(`http://localhost:9200/movies/_doc/${uuidv4()}`, JSON.stringify(document), { headers: { 'Content-Type': 'application/json' } });

    // Kontrola, zda byl požadavek úspěšný
    check(res, {
      'status was 201': (r) => r.status === 201,
      'Response message 201 Created': (r) => r.status_text == '201 Created'
    });
  }

  sleep(5)

  // Získání seznamu indexů
  let res = http.get('http://localhost:9200/_cat/indices?format=json&pretty=true');

  // INFO[0005] [{"pri.store.size":"10.3kb","docs.count":"4","status":"open","index":"movies","uuid":"PQWFR7rWRtCX1es6GIpNvA","pri":"1","rep":"1","docs.deleted":"0","store.size":"10.3kb","health":"yellow"}]  source=console

  // Kontrola, zda byl požadavek úspěšný
  check(res, {
    'status was 200': (r) => r.status === 200,
    'index movies contains four records': (r) => r.json()[0]['docs.count'] === '4',
  });
}