/**
 * Buy iPhone HomeWork
 *
 * How to run
 * k6 run demos/02-examples/Buy-iPhone.js
 */

import { sleep, group } from 'k6'
import http from 'k6/http'

export const options = {
    vus: 1,
    // duration: '1m',
    duration: '10s',
}

export default function main() {
    let response

    group('page_0 - https://www.iwant.cz/', function () {
        response = http.get('https://www.iwant.cz/', {
            headers: {
                'upgrade-insecure-requests': '1',
                'sec-ch-ua': '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
            },
        })
        sleep(1)
        response = http.get('https://www.iwant.cz/Products/Fulltext/AutocompleteItems?query=iphony', {
            headers: {
                'x-requested-with': 'XMLHttpRequest',
                'sec-ch-ua': '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
            },
        })
        sleep(1)
    })

    group('page_1 - https://www.iwant.cz/Vyhledavani?query=iphony', function () {
        response = http.get('https://www.iwant.cz/Vyhledavani?query=iphony', {
            headers: {
                'upgrade-insecure-requests': '1',
                'sec-ch-ua': '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
            },
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
        response = http.get('https://www.iwant.cz/Products/Filter/AllFilterData', {
            headers: {
                'x-requested-with': 'XMLHttpRequest',
                'sec-ch-ua': '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
            },
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
    })

    group(
        'page_2 - https://www.iwant.cz/Apple-iPhone-14-128GB-temne-inkoustovy-p112124',
        function () {
            response = http.get('https://www.iwant.cz/Apple-iPhone-14-128GB-temne-inkoustovy-p112124', {
                headers: {
                    'upgrade-insecure-requests': '1',
                    'sec-ch-ua': '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                },
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
            sleep(6.6)
        }
    )

    group(
        'page_3 - https://www.iwant.cz/Apple-iPhone-14-256GB-temne-inkoustovy-p112126',
        function () {
            response = http.get('https://www.iwant.cz/Apple-iPhone-14-256GB-temne-inkoustovy-p112126', {
                headers: {
                    'upgrade-insecure-requests': '1',
                    'sec-ch-ua': '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                },
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
            sleep(1)
        }
    )
}
