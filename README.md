# k6

## Goal
- https://k6.io/
- Samples https://github.com/loadimpact/k6/tree/master/samples

- research k6.io
- POC
-   REST API (elasticsearch)
-   live logging to elasticsearch
-   Web App
-   Distrib 
- dockerize (dockerizovano jiz je)
- deploy to k8


# Installation
- `docker pull loadimpact/k6`
- `brew install k6`

# How To Run
`docker run --name k6 -i --rm loadimpact/k6 run - < elasticsearch/isUp.js --http-debug=full`

# Convert HAR to K6 test
`k6 convert -O elasticsearch/syntexHomePage.js /Users/rdpanek/HTDOCS/teststack/k6/elasticsearch/har/www.syntex.cz.har`

# Notes

- cloud a opensource verze
- [k6control](https://k6.io/blog/building-a-ui-for-the-k6-load-testing-tool)
- WM primo v testu nebo v konfiguracnim souboru bokem
- podpora pouze http1, http2 a WS
