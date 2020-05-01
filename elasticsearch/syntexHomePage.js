import { group, sleep } from 'k6';
import http from 'k6/http';

// Version: 1.2
// Creator: WebInspector

export let options = {
	maxRedirects: 0,
	vus: 10,
	duration: "30s"
};

export default function() {

	group("page_2 - https://www.syntex.cz/blackmagic-design", function() {
		let req, res;
		req = [{
			"method": "get",
			"url": "https://www.syntex.cz/blackmagic-design",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"dnt": "1",
					"upgrade-insecure-requests": "1",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "navigate",
					"sec-fetch-user": "?1",
					"sec-fetch-dest": "document",
					"referer": "https://www.google.com/",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/20200324-121835/css.css",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "text/css,*/*;q=0.1",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "style",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/lang_CZ.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://use.typekit.net/xhw5loq.js",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "script",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/media/logo/blackmagic-logo.png",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/lang_SK.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/car.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/shop.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/dropdown-black.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/logo.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/shop.jpg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/mastercard.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/visa.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/zasilkovna.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/ppl.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/20200324-121835/js.js",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "script",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.googletagmanager.com/gtm.js?id=GTM-NV48VHM",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "script",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/dropdown.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/styles/20200324-121835/css.css",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://use.typekit.net/af/5855b2/00000000000000003b9b1a98/27/l?primer=9534f20d24153432f138f14be19fe00ed05018076afc824dd1a6f6ca76bae7c7&fvd=n4&v=3",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"origin": "https://www.syntex.cz",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "cors",
					"sec-fetch-dest": "font",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://use.typekit.net/af/30420e/00000000000000003b9b1a9e/27/l?primer=9534f20d24153432f138f14be19fe00ed05018076afc824dd1a6f6ca76bae7c7&fvd=n7&v=3",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"origin": "https://www.syntex.cz",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "cors",
					"sec-fetch-dest": "font",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://use.typekit.net/af/b4d13d/00000000000000003b9b1a9a/27/l?primer=9534f20d24153432f138f14be19fe00ed05018076afc824dd1a6f6ca76bae7c7&fvd=n5&v=3",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"origin": "https://www.syntex.cz",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "cors",
					"sec-fetch-dest": "font",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/webfonts/fa-solid-900.woff2",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"origin": "https://www.syntex.cz",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "cors",
					"sec-fetch-dest": "font",
					"referer": "https://www.syntex.cz/styles/20200324-121835/css.css",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://use.typekit.net/af/7158ff/00000000000000003b9b1a9c/27/l?primer=9534f20d24153432f138f14be19fe00ed05018076afc824dd1a6f6ca76bae7c7&fvd=n6&v=3",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"origin": "https://www.syntex.cz",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "cors",
					"sec-fetch-dest": "font",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/webfonts/fa-brands-400.woff2",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"origin": "https://www.syntex.cz",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "cors",
					"sec-fetch-dest": "font",
					"referer": "https://www.syntex.cz/styles/20200324-121835/css.css",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://webchat.missiveapp.com/487b81f6-18af-497a-a2a3-57a5be2b054d/missive.js",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "script",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://use.typekit.net/af/0c5f71/00000000000000003b9b1aa0/27/l?primer=9534f20d24153432f138f14be19fe00ed05018076afc824dd1a6f6ca76bae7c7&fvd=n9&v=3",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"origin": "https://www.syntex.cz",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "cors",
					"sec-fetch-dest": "font",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://use.typekit.net/af/5dd13e/00000000000000003b9b1a9f/27/l?primer=9534f20d24153432f138f14be19fe00ed05018076afc824dd1a6f6ca76bae7c7&fvd=i9&v=3",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"origin": "https://www.syntex.cz",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "cors",
					"sec-fetch-dest": "font",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://use.typekit.net/af/8948c6/00000000000000003b9b1a9d/27/l?primer=9534f20d24153432f138f14be19fe00ed05018076afc824dd1a6f6ca76bae7c7&fvd=i7&v=3",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"origin": "https://www.syntex.cz",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "cors",
					"sec-fetch-dest": "font",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://use.typekit.net/af/1ca530/00000000000000003b9b1a94/27/l?primer=9534f20d24153432f138f14be19fe00ed05018076afc824dd1a6f6ca76bae7c7&fvd=n2&v=3",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"origin": "https://www.syntex.cz",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "cors",
					"sec-fetch-dest": "font",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://use.typekit.net/af/ef2771/00000000000000003b9b1a93/27/l?primer=9534f20d24153432f138f14be19fe00ed05018076afc824dd1a6f6ca76bae7c7&fvd=i2&v=3",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"origin": "https://www.syntex.cz",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "cors",
					"sec-fetch-dest": "font",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://use.typekit.net/af/572508/00000000000000003b9b1a96/27/l?primer=9534f20d24153432f138f14be19fe00ed05018076afc824dd1a6f6ca76bae7c7&fvd=n3&v=3",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"origin": "https://www.syntex.cz",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "cors",
					"sec-fetch-dest": "font",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://use.typekit.net/af/111def/00000000000000003b9b1a95/27/l?primer=9534f20d24153432f138f14be19fe00ed05018076afc824dd1a6f6ca76bae7c7&fvd=i3&v=3",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"origin": "https://www.syntex.cz",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "cors",
					"sec-fetch-dest": "font",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://use.typekit.net/af/961cbb/00000000000000003b9b1a99/27/l?primer=9534f20d24153432f138f14be19fe00ed05018076afc824dd1a6f6ca76bae7c7&fvd=i5&v=3",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"origin": "https://www.syntex.cz",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "cors",
					"sec-fetch-dest": "font",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://use.typekit.net/af/98f96f/00000000000000003b9b1a97/27/l?primer=9534f20d24153432f138f14be19fe00ed05018076afc824dd1a6f6ca76bae7c7&fvd=i4&v=3",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"origin": "https://www.syntex.cz",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "cors",
					"sec-fetch-dest": "font",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://use.typekit.net/af/e344c9/00000000000000003b9b1a9b/27/l?primer=9534f20d24153432f138f14be19fe00ed05018076afc824dd1a6f6ca76bae7c7&fvd=i6&v=3",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"origin": "https://www.syntex.cz",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "cors",
					"sec-fetch-dest": "font",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://p.typekit.net/p.gif?s=1&k=xhw5loq&ht=tk&h=www.syntex.cz&f=24537.24538.24539.24540.24541.24542.24543.24544.24545.24546.24547.24548.24549.24552&a=6126408&js=1.19.2&app=typekit&e=js&_=1588334752607",
			"params": {
				"headers": {
					"Host": "p.typekit.net",
					"Connection": "keep-alive",
					"Pragma": "no-cache",
					"Cache-Control": "no-cache",
					"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"DNT": "1",
					"Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"Sec-Fetch-Site": "cross-site",
					"Sec-Fetch-Mode": "no-cors",
					"Sec-Fetch-Dest": "image",
					"Referer": "https://www.syntex.cz/blackmagic-design",
					"Accept-Encoding": "gzip, deflate, br",
					"Accept-Language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.google-analytics.com/analytics.js",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "script",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.googleadservices.com/pagead/conversion_async.js",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"x-client-data": "CIm2yQEIpbbJAQjBtskBCKmdygEI0K/KAQi8sMoBCJy1ygEI7bXKAQjEtsoBCI66ygE=",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "script",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://connect.facebook.net/en_US/fbevents.js",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "script",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://c.imedia.cz/js/retargeting.js",
			"params": {
				"cookies": {
					"APNUID": "7115990414869564105",
					"KADUSERCOOKIE": "CC900524-AF0B-4E23-B158-F0DF60868BEE",
					"sid": "id=17747870600470813533|t=1576496725.433|te=1588334739.794|c=8770C479FCB4825765C5475865C31E78"
				},
				"headers": {
					"Host": "c.imedia.cz",
					"Connection": "keep-alive",
					"Pragma": "no-cache",
					"Cache-Control": "no-cache",
					"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"DNT": "1",
					"Accept": "*/*",
					"Sec-Fetch-Site": "cross-site",
					"Sec-Fetch-Mode": "no-cors",
					"Sec-Fetch-Dest": "script",
					"Referer": "https://www.syntex.cz/blackmagic-design",
					"Accept-Encoding": "gzip, deflate, br",
					"Accept-Language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://c/imedia.cz/retargeting?id=493378&url=https%3A%2F%2Fwww.syntex.cz%2Fblackmagic-design&gtmcb=357390479",
			"params": {
				"headers": {
					"Referer": "https://www.syntex.cz/blackmagic-design",
					"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"DNT": "1"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/menu/audio.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/menu/baterie-a-nabijecky.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/menu/kamery.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/menu/kabely.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/menu/monitory-projektory.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/menu/objektivy-a-filtry.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/menu/software.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/menu/strihove-karty.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/styles/img/menu/strizny-a-rezie.svg",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "post",
			"url": "https://www.syntex.cz/ajax/_sklad.php",
			"body": "sort=0&vmin_0=283&vmax_0=796726&cmin_0=283&cmax_0=796726&&vyrobceid=15&sort=0",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"accept": "application/json, text/javascript, */*; q=0.01",
					"dnt": "1",
					"x-requested-with": "XMLHttpRequest",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
					"origin": "https://www.syntex.cz",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "cors",
					"sec-fetch-dest": "empty",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://connect.facebook.net/signals/config/172116007451560?v=2.9.18&r=stable",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "script",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.google-analytics.com/collect?v=1&_v=j81&a=1999145482&t=pageview&_s=1&dl=https%3A%2F%2Fwww.syntex.cz%2Fblackmagic-design&dr=https%3A%2F%2Fwww.google.com%2F&ul=cs-cz&de=UTF-8&dt=Blackmagic%20Design%20%2F%20SYNTEX.CZ&sd=24-bit&sr=2048x1152&vp=2048x342&je=0&_u=QACAAEABAAAAg~&jid=&gjid=&cid=2137885820.1585555851&tid=UA-126202993-1&_gid=98913778.1588246881&gtm=2wg4m0NV48VHM&z=776135579",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.facebook.com/tr/?id=172116007451560&ev=PageView&dl=https%3A%2F%2Fwww.syntex.cz%2Fblackmagic-design&rl=https%3A%2F%2Fwww.google.com%2F&if=false&ts=1588334752752&sw=2048&sh=1152&v=2.9.18&r=stable&a=tmgoogletagmanager&ec=0&o=30&fbp=fb.1.1585555850712.688043764&it=1588334752658&coo=false&rqm=GET",
			"params": {
				"cookies": {
					"datr": "RzWEXhH9WKTu_gZksy2TX29R",
					"sb": "STWEXrVSvMEfiXof2vQYeNr3",
					"c_user": "1626093621",
					"xs": "22%3ADI5IrmOwoEg62w%3A2%3A1585722697%3A9690%3A13535",
					"fr": "0krLHoceBRPirfDQT.AWXtrnoBrKSIEaLPPVOrP-uYoIc.BegfLM.NU.F6q.0.0.Beqsq3.AWWd8lW_",
					"wd": "1920x946",
					"presence": "EDvF3EtimeF1588254340EuserFA21626093621A2EstateFDutF1588254340517CEchF_7bCC",
					"spin": "r.1002071999_b.trunk_t.1588334711_s.1_v.2_"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://c.imedia.cz/retargeting?id=90987&category=&itemId=&url=https%3A%2F%2Fwww.syntex.cz%2Fblackmagic-design",
			"params": {
				"cookies": {
					"APNUID": "7115990414869564105",
					"KADUSERCOOKIE": "CC900524-AF0B-4E23-B158-F0DF60868BEE",
					"sid": "id=17747870600470813533|t=1576496725.433|te=1588334739.794|c=8770C479FCB4825765C5475865C31E78"
				},
				"headers": {
					"Host": "c.imedia.cz",
					"Connection": "keep-alive",
					"Pragma": "no-cache",
					"Cache-Control": "no-cache",
					"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"DNT": "1",
					"Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"Sec-Fetch-Site": "cross-site",
					"Sec-Fetch-Mode": "no-cors",
					"Sec-Fetch-Dest": "image",
					"Referer": "https://www.syntex.cz/blackmagic-design",
					"Accept-Encoding": "gzip, deflate, br",
					"Accept-Language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.googleadservices.com/pagead/conversion/747128781/?random=1588334752786&cv=9&fst=1588334752786&num=1&value=0&label=ThwdCPGb_MIBEM2PoeQC&guid=ON&resp=GooglemKTybQhCsO&u_h=1152&u_w=2048&u_ah=1077&u_aw=2048&u_cd=24&u_his=4&u_tz=120&u_java=false&u_nplug=3&u_nmime=4&gtm=2wg4m0&sendb=1&ig=1&gac=UA-126202993-1%3ACj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB&frm=0&url=https%3A%2F%2Fwww.syntex.cz%2Fblackmagic-design&ref=https%3A%2F%2Fwww.google.com%2F&tiba=Blackmagic%20Design%20%2F%20SYNTEX.CZ&hn=www.googleadservices.com&bttype=purchase&async=1&rfmt=3&fmt=4",
			"params": {
				"cookies": {
					"Conversion": "EhMIk7L3uaKQ6QIVk-FRCh3sLQAJGAAgw_SvwbfFx92HAUgBkAHnn-_XiAuYAQA"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "*/*",
					"x-client-data": "CIm2yQEIpbbJAQjBtskBCKmdygEI0K/KAQi8sMoBCJy1ygEI7bXKAQjEtsoBCI66ygE=",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "script",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://googleads.g.doubleclick.net/pagead/viewthroughconversion/747128781/?random=1025890409&cv=9&fst=*&num=1&value=0&label=ThwdCPGb_MIBEM2PoeQC&guid=ON&resp=GooglemKTybQhCsO&u_h=1152&u_w=2048&u_ah=1077&u_aw=2048&u_cd=24&u_his=4&u_tz=120&u_java=false&u_nplug=3&u_nmime=4&gtm=2wg4m0&sendb=1&ig=1&gac=*&frm=0&url=https://www.syntex.cz/blackmagic-design&ref=https://www.google.com/&tiba=Blackmagic%20Design%20%2F%20SYNTEX.CZ&hn=www.googleadservices.com&async=1&fmt=3&ctc_id=CAEVAQAAAB0BAAAA&ct_cookie_present=true&convclickts=1588253794621715&attr_src=1&ssc=ChpDSk95OTdtaWtPa0NGWlBoVVFvZDdDMEFDURgAQhMIzPXphdCS6QIVSLB7Ch3S2A0USAFQrYXqhdCS6QI&sscte=1&crd=&gtd=CkcKRQo9CgkI8O6p9QUQ6gESLACjGxw2eXX7UCaiXvWt49yf_aBPfMVwfMfdiEd012fDmS_cZK6nrTdQjAp1GgJzzRAC8P8HAQ&eitems=ChEI8JGv9QUQ__O9wd7Wv6XdARIdAA9ZdTwJeNvcPdRxoye8dVoOiqrvfQPQ91F_vfE",
			"params": {
				"cookies": {
					"_fbp": "fb.1.1586709524357.552062188",
					"IDE": "AHWqTUnBf0v914X4MUn--lPsH2Y_OdHDzQWf-WHoKeZXjBme8ZCEPOespkTaJHjM",
					"DSID": "AAO-7r6SPaJm08I8aCIPfzW4B-Lo0ywy0jcMX-hx_65qVARa6jE27b1ytumXPJ--3DpTCxuN-_3eoM_POeD-u-PdLCr6tqbcdUNJblwPN2A8U0JtUACFPMY"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"x-client-data": "CIm2yQEIpbbJAQjBtskBCKmdygEI0K/KAQi8sMoBCJy1ygEI7bXKAQjEtsoBCI66ygE=",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.google.com/pagead/1p-conversion/747128781/?random=1025890409&cv=9&fst=*&num=1&value=0&label=ThwdCPGb_MIBEM2PoeQC&guid=ON&resp=GooglemKTybQhCsO&u_h=1152&u_w=2048&u_ah=1077&u_aw=2048&u_cd=24&u_his=4&u_tz=120&u_java=false&u_nplug=3&u_nmime=4&gtm=2wg4m0&sendb=1&ig=1&gac=*&frm=0&url=https://www.syntex.cz/blackmagic-design&ref=https://www.google.com/&tiba=Blackmagic%20Design%20%2F%20SYNTEX.CZ&hn=www.googleadservices.com&async=1&fmt=3&ctc_id=CAEVAQAAAB0BAAAA&ct_cookie_present=true&convclickts=1588253794621715&attr_src=1&ssc=ChpDSk95OTdtaWtPa0NGWlBoVVFvZDdDMEFDURgAQhMIzPXphdCS6QIVSLB7Ch3S2A0USAFQrYXqhdCS6QI&sscte=1&crd=&gtd=CkcKRQo9CgkI8O6p9QUQ6gESLACjGxw2eXX7UCaiXvWt49yf_aBPfMVwfMfdiEd012fDmS_cZK6nrTdQjAp1GgJzzRAC8P8HAQ&is_vtc=1&cid=CAQSMACNIrLM3eXssCRMz4Gg5wcxXboEhvWgZX4cRu927DUi6J_IkDyqn-WO7d0wNNJ3Tw&eitems=ChEI8JGv9QUQ__O9wd7Wv6XdARIdAA9ZdTybYdCl_k66f7XjT6-EHbDjZ1pqSgFAcUI&random=656692003&resp=GooglemKTybQhCsO",
			"params": {
				"cookies": {
					"CONSENT": "YES+CZ.cs+20160131-13-0",
					"OTZ": "5406536_48_52_123900_48_436380",
					"SID": "wAfaIVv3yXUPGKm943j1GfYmJBUj9jdaLp3iWOmE0CAOhrvguOIsLClvF3Q554ijbNClJQ.",
					"__Secure-3PSID": "wAfaIVv3yXUPGKm943j1GfYmJBUj9jdaLp3iWOmE0CAOhrvgbPw0hhe1CRYb8Z5k8r7FWA.",
					"HSID": "A4KIXn7ieMrx3k5iU",
					"SSID": "ATZUiQNG4BXpn-6rN",
					"APISID": "RkZtBZA0YfAU9Sv3/AKH-jiVxpcoP-NM6v",
					"SAPISID": "6sQfwk1mKsIVXgUd/Agmkeq_byjtxU2n9k",
					"__Secure-HSID": "A4KIXn7ieMrx3k5iU",
					"__Secure-SSID": "ATZUiQNG4BXpn-6rN",
					"__Secure-APISID": "RkZtBZA0YfAU9Sv3/AKH-jiVxpcoP-NM6v",
					"__Secure-3PAPISID": "6sQfwk1mKsIVXgUd/Agmkeq_byjtxU2n9k",
					"__Secure-3PSIDCC": "AJi4QfGVZpaUrPnBzZg9QJfjz8Ov536kGH_LlHLzEdRBKYSCvjKdIgr2Dc3COWuaa0HX-EWi",
					"ANID": "AHWqTUniEBtCbxMU0IfzKZ-9uoEKoRsaFo3vxojEjumIE2asSa6hCD8hIqE6x_Yy",
					"NID": "203=JLRaI4fBb6gCBRnnANstTWR3LHbTdjKYkbivnHGGiRM5QaSZrro6QWlNwa2LpPhtYTBvPNnqNOB7zk2epgQVuhmHxkLQ7z-gMO8g4BWjhWujDr3dUTG72F_E452pmUIkyiMYghiv0eH7YFjjqichJ4gNiG2LStJ7tIuqGChs57hNrxVGoFe2cbMUDkt1kqyIFceQnpMLfdkZKRrS-VLrV0HIvVM7qiuZf7QD6WO16x7jvbXDJK3W4Xs8gMGh-CotCJDtW-_a",
					"1P_JAR": "2020-05-01-12",
					"DV": "E7-zqPaGvBtJIBy4P1MyROuwyQUCHReHOyNFM9ZB1gQAALC-OcS5CfPkNQEAAKCB8PQiUMTihgAAAA",
					"SIDCC": "AJi4QfHEWjF_kJAOt8th6fvd0Cbmkgir4NCbCdAyGOiMeIlQMbADWpB-hCjAGfY9IS7oacH5RlWX"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"x-client-data": "CIm2yQEIpbbJAQjBtskBCKmdygEI0K/KAQi8sMoBCJy1ygEI7bXKAQjEtsoBCI66ygE=",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.google.cz/pagead/1p-conversion/747128781/?random=1025890409&cv=9&fst=*&num=1&value=0&label=ThwdCPGb_MIBEM2PoeQC&guid=ON&resp=GooglemKTybQhCsO&u_h=1152&u_w=2048&u_ah=1077&u_aw=2048&u_cd=24&u_his=4&u_tz=120&u_java=false&u_nplug=3&u_nmime=4&gtm=2wg4m0&sendb=1&ig=1&gac=*&frm=0&url=https://www.syntex.cz/blackmagic-design&ref=https://www.google.com/&tiba=Blackmagic%20Design%20%2F%20SYNTEX.CZ&hn=www.googleadservices.com&async=1&fmt=3&ctc_id=CAEVAQAAAB0BAAAA&ct_cookie_present=true&convclickts=1588253794621715&attr_src=1&ssc=ChpDSk95OTdtaWtPa0NGWlBoVVFvZDdDMEFDURgAQhMIzPXphdCS6QIVSLB7Ch3S2A0USAFQrYXqhdCS6QI&sscte=1&crd=&gtd=CkcKRQo9CgkI8O6p9QUQ6gESLACjGxw2eXX7UCaiXvWt49yf_aBPfMVwfMfdiEd012fDmS_cZK6nrTdQjAp1GgJzzRAC8P8HAQ&is_vtc=1&cid=CAQSMACNIrLM3eXssCRMz4Gg5wcxXboEhvWgZX4cRu927DUi6J_IkDyqn-WO7d0wNNJ3Tw&eitems=ChEI8JGv9QUQ__O9wd7Wv6XdARIdAA9ZdTybYdCl_k66f7XjT6-EHbDjZ1pqSgFAcUI&random=656692003&resp=GooglemKTybQhCsO&ipr=y&ezwbk=AZuM4hAt_JQDsfCAHxqKoMYkZz9O0vsmFegS5KKGLwUQ3hUvX8Y6_2MegI8BDhq1aGXfXdmhp6Yfse3s7RcoIr-T0QMJ",
			"params": {
				"cookies": {
					"CONSENT": "YES+CZ.cs+20160131-13-0",
					"SID": "wAfaIVv3yXUPGKm943j1GfYmJBUj9jdaLp3iWOmE0CAOhrvguOIsLClvF3Q554ijbNClJQ.",
					"__Secure-3PSID": "wAfaIVv3yXUPGKm943j1GfYmJBUj9jdaLp3iWOmE0CAOhrvgbPw0hhe1CRYb8Z5k8r7FWA.",
					"HSID": "AIDJzVqg6uvLGvzXA",
					"SSID": "AoX-d1Q6YqwMpJFYV",
					"APISID": "RkZtBZA0YfAU9Sv3/AKH-jiVxpcoP-NM6v",
					"SAPISID": "6sQfwk1mKsIVXgUd/Agmkeq_byjtxU2n9k",
					"__Secure-HSID": "AIDJzVqg6uvLGvzXA",
					"__Secure-SSID": "AoX-d1Q6YqwMpJFYV",
					"__Secure-APISID": "RkZtBZA0YfAU9Sv3/AKH-jiVxpcoP-NM6v",
					"__Secure-3PAPISID": "6sQfwk1mKsIVXgUd/Agmkeq_byjtxU2n9k",
					"ANID": "AHWqTUls9XtQiL3CAM1BFkRKIRLqdAm8LlJXaRXMWVlxMwj73WyBHiUO2oeTvEe6",
					"NID": "203=iQtwLtj_pxokPCQvlaOnUD2toaoUAEs1o0B0SAOeCWU0cO5eFwZ4MDSDFGS-fLWlhVYtcdMzZTG9YQtvg0JNfgOX0fYCneU1Y6mxNNaHhSr2Bj9lJSrNO7cIlCWVOjnMY-HVfwfV7TGkQjz9xnrI8ocLICHU8IMTuQ4zS6pdqlwpRu6CWO1wTjMgmgHVY0MR0iwBR_mMm9_JplRUbl5fTDyBR5J3gJ7crNQzNCoZR2sYRigMHYiruHHeU0zcKPoQ1eEquF-H167ojEJi",
					"1P_JAR": "2020-5-1-11"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"x-client-data": "CIm2yQEIpbbJAQjBtskBCKmdygEI0K/KAQi8sMoBCJy1ygEI7bXKAQjEtsoBCI66ygE=",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://webchat.missiveapp.com/487b81f6-18af-497a-a2a3-57a5be2b054d/webchat",
			"params": {
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"upgrade-insecure-requests": "1",
					"dnt": "1",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "navigate",
					"sec-fetch-dest": "iframe",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.facebook.com/tr/?id=172116007451560&ev=Microdata&dl=https%3A%2F%2Fwww.syntex.cz%2Fblackmagic-design&rl=https%3A%2F%2Fwww.google.com%2F&if=false&ts=1588334753257&cd[DataLayer]=%5B%5D&cd[Meta]=%7B%22title%22%3A%22Blackmagic%20Design%20%2F%20SYNTEX.CZ%22%2C%22meta%3Adescription%22%3A%22Blackmagic%20Design%22%7D&cd[OpenGraph]=%7B%22og%3Atitle%22%3A%22Blackmagic%20Design%20%2F%20SYNTEX.CZ%22%2C%22og%3Adescription%22%3A%22Blackmagic%20Design%22%2C%22og%3Aimage%22%3A%22https%3A%2F%2Fwww.syntex.cz%2Fmedia%2Ffacebook%2Ffbshare.png%22%2C%22og%3Asite_name%22%3A%22SYNTEX.CZ%22%2C%22og%3Aurl%22%3A%22https%3A%2F%2Fwww.syntex.cz%2Fblackmagic-design%22%7D&cd[Schema.org]=%5B%5D&cd[JSON-LD]=%5B%5D&sw=2048&sh=1152&v=2.9.18&r=stable&a=tmgoogletagmanager&ec=1&o=30&fbp=fb.1.1585555850712.688043764&it=1588334752658&coo=false&es=automatic&tm=3&rqm=GET",
			"params": {
				"cookies": {
					"datr": "RzWEXhH9WKTu_gZksy2TX29R",
					"sb": "STWEXrVSvMEfiXof2vQYeNr3",
					"c_user": "1626093621",
					"xs": "22%3ADI5IrmOwoEg62w%3A2%3A1585722697%3A9690%3A13535",
					"fr": "0krLHoceBRPirfDQT.AWXtrnoBrKSIEaLPPVOrP-uYoIc.BegfLM.NU.F6q.0.0.Beqsq3.AWWd8lW_",
					"wd": "1920x946",
					"presence": "EDvF3EtimeF1588254340EuserFA21626093621A2EstateFDutF1588254340517CEchF_7bCC",
					"spin": "r.1002071999_b.trunk_t.1588334711_s.1_v.2_"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "cross-site",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "image",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		},{
			"method": "get",
			"url": "https://www.syntex.cz/favicon.ico",
			"params": {
				"cookies": {
					"_ga": "GA1.2.2137885820.1585555851",
					"_fbp": "fb.1.1585555850712.688043764",
					"PHPSESSID": "d9ca902874d04b40d751390f5564956c",
					"_gid": "GA1.2.98913778.1588246881",
					"orderid": "10001402",
					"_gac_UA-126202993-1": "1.1588253795.Cj0KCQjw7qn1BRDqARIsAKMbHDZ5dftQJqJe9a3j3J_9oE98xXB8x92IR3TXZ8OZL9xkrqetN1CMCnUaAnPNEALw_wcB",
					"_gat_UA-126202993-1": "1"
				},
				"headers": {
					"pragma": "no-cache",
					"cache-control": "no-cache",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
					"dnt": "1",
					"accept": "image/webp,image/apng,image/*,*/*;q=0.8",
					"sec-fetch-site": "same-origin",
					"sec-fetch-mode": "no-cors",
					"sec-fetch-dest": "empty",
					"referer": "https://www.syntex.cz/blackmagic-design",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "cs-CZ,cs;q=0.9,en;q=0.8,sk;q=0.7"
				}
			}
		}];
		res = http.batch(req);
		// Random sleep between 20s and 40s
		//sleep(Math.floor(Math.random()*20+20));
	});

}
