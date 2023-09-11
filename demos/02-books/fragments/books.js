import { check, group, fail } from 'k6'
import { Rate, Trend } from 'k6/metrics'
import { Httpx } from 'https://jslib.k6.io/httpx/0.0.3/index.js'

const classicBookExistCheck = new Rate('classicBookExist')
const eBookExistCheck = new Rate('eBookExist')
const classicBookLoadedTime = new Trend('classicBookLoaded_time')
const eBookLoadedTime = new Trend('eBookLoaded_time')
let response

const classicBooks = function(config = fail(`login: missing config.`), data) {
  const { traceId, domain } = config
  const session = new Httpx({
    baseURL: `${domain}`,
    headers: {
      'x-b3-traceid': traceId,
      //'Content-Encoding': 'gzip'
    },
    timeout: 20000,
  })

  group('Check classic books api', function () {
    response = session.get('/books/běžná kniha');
    check(response, {
      'Get books status code is 200': (r) => r.status === 200
    });
    let classicBookExist = check(response, {
      'Get books contains name of classic book': (res) => res.body.includes(`běžná kniha`)
    });
    classicBookExistCheck.add(classicBookExist)
    classicBookLoadedTime.add(response.timings.duration)

    response = session.put('/book/1', JSON.stringify({ 
      type: 'běžná kniha', 
      title: 'Upravená Běžná Kniha', 
      author: 'Upravený Autor 1' 
    }), { 
      headers: { 
        'Content-Type': 'application/json' 
      } 
    });
    check(response, {
      'Update book status code is 200': (r) => r.status === 200
    });
  })
}


const ebooks = function(config = fail(`login: missing config.`), data) {
  const { traceId, domain } = config
  const session = new Httpx({
    baseURL: `${domain}`,
    headers: {
      'x-b3-traceid': traceId,
      'Content-Encoding': 'gzip'
    },
    timeout: 20000,
  })

  group('Check ebooks api', function () {
    response = session.get('/books/e-kniha');
    check(response, {
      'Get ebook status code is 200': (r) => r.status === 200
    });
    let eBookExist = check(response, {
      'Get books contains name of ebook': (res) => res.body.includes(`e-kniha`)
    });
    eBookLoadedTime.add(response.timings.duration)
    eBookExistCheck.add(eBookExist)

    response = session.put('/book/2', JSON.stringify({ 
      type: 'e-kniha', 
      title: 'Upravená E-Kniha',
      author: 'Upravený Autor 2'
    }), { 
      headers: { 
        //'Content-Type': 'application/json' 
      } });
    check(response, {
      'Update ebook status code is 200': (r) => r.status === 200
    });
  })
}




module.exports = {
  classicBooks,
  ebooks
}