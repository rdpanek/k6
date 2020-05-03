FROM loadimpact/k6:0.26.2

COPY ./elasticsearch/elasticsearch.js /home/k6

CMD ["run", "/home/k6/elasticsearch.js", "--http-debug=full"]