/**
 * Buy iPhone HomeWork
 *
 * https://github.com/rdpanek/k6/blob/master/demos/02-examples/Buy-iPhone.md
 *
 * How to run
 * k6 run demos/02-examples/Buy-iPhone.js
 */

import {sleep, group, check} from 'k6'
import http from 'k6/http'
import {Gauge} from "k6/metrics";

// https://k6.io/docs/using-k6/metrics/create-custom-metrics/
const suggesterReturnedItems = new Gauge('suggester_returned_items');

export const options = {
    thresholds: {
        // https://k6.io/docs/using-k6/metrics/#what-metrics-to-look-at
        // https://k6.io/docs/using-k6/metrics/reference/#http
        http_req_duration: ['p(100)<1000'], // X% of requests should be below 200ms
        http_req_failed: ['rate==0.00'],
        //
        // custom metrics
        //
        // 'delete_index_success_count': ['count==1'],
        // 'delete_index_error_count': ['count==0'],

        // NFR: Našeptávač musí vrátit více jako 10 iphonů.
        'suggester_returned_items': ['value>10'],
    },
    vus: 1,
    // duration: '5m',
    duration: '10s',

}

export default function main() {
    let response

    group('page_0 - iwant homepage', function () {
        response = http.get('https://www.iwant.cz/', {
            headers: {
                'upgrade-insecure-requests': '1',
                'sec-ch-ua': '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
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
                'sec-ch-ua': '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
            },
        })
        check(response, {
            'status was 200': (r) => r.status === 200,
        })

        response = http.get(
            'https://www.iwant.cz/Products/Filter/AllAttributeFilterData?categoryId=null',
            {
                headers: {
                    'x-requested-with': 'XMLHttpRequest',
                    'sec-ch-ua': '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
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
                    'sec-ch-ua': '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                },
            }
        )
        check(response, {
            'status was 200': (r) => r.status === 200,
        })

        response = http.get('https://www.iwant.cz/Products/Filter/AllFilterData', {
            headers: {
                'x-requested-with': 'XMLHttpRequest',
                'sec-ch-ua': '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
            },
        })
        check(response, {
            'status was 200': (r) => r.status === 200,
            // NFR: Číselník vrátí více jak 1000 filtrů.
            'Response of AllFilterData contains more than 1000 items': (r) => r.json().length > 1000,
        })

        sleep(0.7)

        response = http.get(
            'https://www.iwant.cz/Products/Helper/Pager?totalCount=5384&pageSize=12&currentPage=1&allPages=false',
            {
                headers: {
                    'x-requested-with': 'XMLHttpRequest',
                    'sec-ch-ua': '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                },
            }
        )
        check(response, {
            'status was 200': (r) => r.status === 200,
        })

    })

    group(
        'page_2 - open iphone detail',
        function () {
            response = http.get('https://www.iwant.cz/Apple-iPhone-14-128GB-temne-inkoustovy-p112124', {
                headers: {
                    'upgrade-insecure-requests': '1',
                    'sec-ch-ua': '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                },
            })

            check(response, {
                'status was 200': (r) => r.status === 200,
                'particular iphone model found': (r) => r.body.includes('<meta name="title" content="Apple iPhone 14 128GB temně inkoustový | iWant.cz" />')

            })

            response = http.get(
                'https://www.iwant.cz/Products/Detail/ProductDescription?id=112124&cg=2&it=&type=popis&buyoutCategoryId=null',
                {
                    headers: {
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua': '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"macOS"',
                    },
                }
            )
            check(response, {
                'status was 200': (r) => r.status === 200,
            })

            sleep(6.6)
        }
    )

    group(
        'page_3 - change iphone model',
        function () {
            response = http.get('https://www.iwant.cz/Apple-iPhone-14-256GB-temne-inkoustovy-p112126', {
                headers: {
                    'upgrade-insecure-requests': '1',
                    'sec-ch-ua': '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                },
            })
            check(response, {
                'status was 200': (r) => r.status === 200,
            })

            response = http.get(
                'https://www.iwant.cz/Products/Detail/ProductDescription?id=112126&cg=2&it=&type=popis&buyoutCategoryId=null',
                {
                    headers: {
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua': '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"macOS"',
                    },
                }
            )
            check(response, {
                'status was 200': (r) => r.status === 200,
            })

            sleep(1)
        }
    )
}
