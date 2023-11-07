/**
 * Buy iPhone HomeWork
 *
 * https://github.com/rdpanek/k6/blob/master/demos/02-examples/Buy-iPhone.md
 *
 * How to run
 * k6 run demos/02-examples/Buy-iPhone.js
 */

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
// https://github.com/cheeriojs/cheerio#cheerio

import {sleep, group, check} from 'k6'
import http from 'k6/http'
import { Gauge } from "k6/metrics";
import { parseHTML } from 'k6/html';
// import * as cheerio from 'cheerio';

// https://k6.io/docs/using-k6/metrics/create-custom-metrics/
const suggesterReturnedItems = new Gauge('suggester_returned_items');

// const cheerio = require('cheerio');

export const options = {
    thresholds: {
        // https://k6.io/docs/using-k6/metrics/#what-metrics-to-look-at
        // https://k6.io/docs/using-k6/metrics/reference/#http
        http_req_duration: ['p(95)<1000'], // X% of requests should be below 200ms
        http_req_failed: ['rate==0.00'],
        //
        // custom metrics
        //

        // NFR: Našeptávač musí vrátit více jako 10 iphonů.
        // Q?: checking tags/labels
        'suggester_returned_items': ['value>10'],
    },
    scenarios: {
        // https://k6.io/docs/using-k6/scenarios/executors/constant-vus/
        iwantUserJourney: {
            executor: 'constant-vus',
            vus: 1,
            duration: '30s',
        },
    },
}

export default function main() {
    let response
    let doc
    let pageTitle

    group('page_0 - iwant homepage', function () {
        response = http.get('https://www.iwant.cz/', {
            headers: {
                'upgrade-insecure-requests': '1',
            },
        })
        check(response, {
            'status was 200': (r) => r.status === 200,
        })
        sleep(1)

        group('page_0 - suggester', function () {
            let suggesterQueries = ["ipho", "iphony", "iphone 15 pro max"];

            for (let suggesterQuery of suggesterQueries) {
                response = http.get(`https://www.iwant.cz/Products/Fulltext/AutocompleteItems?query=${suggesterQuery}`, {
                    headers: {
                        'x-requested-with': 'XMLHttpRequest',
                    },
                })
                let sugLength = response.json().length
                // console.log("DEBUG: suggester response: length: ", sugLength)
                suggesterReturnedItems.add(sugLength, {query: suggesterQuery})

                check(response, {
                    'status was 200': (r) => r.status === 200,
                    'returned item wasn\'t zero': sugLength > 0,
                })
                sleep(1)
            }
        })
    })

    group('page_1 - find iphones', function () {
        let findQuery = 'iphony'
        response = http.get(`https://www.iwant.cz/Vyhledavani?query=${findQuery}`, {
            headers: {
                'upgrade-insecure-requests': '1',
            },
            tags: {
                query: findQuery,
            }
        })
        check(response, {
            'status was 200': (r) => r.status === 200,
        })

        response = http.get(
            'https://www.iwant.cz/Products/Filter/AllAttributeFilterData?categoryId=null',
            {
                headers: {
                    'x-requested-with': 'XMLHttpRequest',
                },
            }
        )
        check(response, {
            'status was 200': (r) => r.status === 200,
        })

        response = http.get(
            'https://www.iwant.cz/Products/Fulltext/SearchResultItems?ftQuery=iphony&ctx=101&itId=&cg=2&paramJson=',
            {
                headers: {
                    'x-requested-with': 'XMLHttpRequest',
                },
            }
        )
        const matches = response.body.match(/<div class="productList-item"/g);
        // console.log(`DEBUG: productList items: ${matches.length}`)
        check(response, {
            'status was 200': (r) => r.status === 200,
            'found 12 items': matches.length === 12,
        })

        response = http.get('https://www.iwant.cz/Products/Filter/AllFilterData', {
            headers: {
                'x-requested-with': 'XMLHttpRequest',
            },
        })
        // console.log("DEBUG: allFilterData length: ", response.json().length)
        check(response, {
            'status was 200': (r) => r.status === 200,
            // NFR: Číselník vrátí více jak 1000 filtrů.
            'Response of AllFilterData contains more than 500 items': (r) => r.json().length > 500,
        })

        sleep(0.7)

        // strankovani
        response = http.get(
            'https://www.iwant.cz/Products/Helper/Pager?totalCount=5384&pageSize=12&currentPage=1&allPages=false',
            {
                headers: {
                    'x-requested-with': 'XMLHttpRequest',
                },
            }
        )
        // <button type="button" class="pager-page " data-page="2">2</button>

        check(response, {
            'status was 200': (r) => r.status === 200,
        })

    })

    group(
        'page_2 - open iphone detail',
        function () {
            // load page
            response = http.get('https://www.iwant.cz/Apple-iPhone-14-128GB-temne-inkoustovy-p112124', {
                headers: {
                    'upgrade-insecure-requests': '1',
                },
            })

            doc = parseHTML(response.body); // equivalent to res.html()
            pageTitle = doc.find('head title').text();
            // console.log(`DEBUG: pageTitle: "${pageTitle}"`)

            check(response,
                {
                    'status was 200': (r) => r.status === 200,
                    'particular iphone model found': pageTitle === "Apple iPhone 14 128GB temně inkoustový | iWant.cz"
                },
                {
                    type: 'itemDetail'
                })

            // load model description
            response = http.get(
                'https://www.iwant.cz/Products/Detail/ProductDescription?id=112124&cg=2&it=&type=popis&buyoutCategoryId=null',
                {
                    headers: {
                        'x-requested-with': 'XMLHttpRequest',
                    },
                }
            )

            check(response, {
                'status was 200': (r) => r.status === 200,
                'model details keyword found':
                    (r) => r.body.includes('<p class="copy z9b16b1 channel-custom-font-custom-80-headline-super">Multitalent.</p>')
            })

            sleep(1)
        }
    )

    group(
        'page_3 - change iphone model',
        function () {
            // load page
            response = http.get('https://www.iwant.cz/Apple-iPhone-14-256GB-temne-inkoustovy-p112126', {
                headers: {
                    'upgrade-insecure-requests': '1',
                },
            })

            doc = parseHTML(response.body); // equivalent to res.html()
            pageTitle = doc.find('head title').text();
            // console.log(`DEBUG: pageTitle: "${pageTitle}"`)

            check(response,
                {
                    'status was 200': (r) => r.status === 200,
                    'particular iphone model found': pageTitle === "Apple iPhone 14 256GB temně inkoustový | iWant.cz"
                },
                {
                    type: 'itemDetail'
                }
            )

            // load model description
            response = http.get(
                'https://www.iwant.cz/Products/Detail/ProductDescription?id=112126&cg=2&it=&type=popis&buyoutCategoryId=null',
                {
                    headers: {
                        'x-requested-with': 'XMLHttpRequest',
                    },
                }
            )
            check(response, {
                'status was 200': (r) => r.status === 200,
                'model details keyword found':
                    (r) => r.body.includes('<p class="copy z9b16b1 channel-custom-font-custom-80-headline-super">Multitalent.</p>')
            })

            sleep(1)
        }
    )
}
