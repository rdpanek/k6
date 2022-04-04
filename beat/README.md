
## Filebeat

```
docker run --net canary --name filebeat  \
--volume="$(pwd)/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro" \
docker.elastic.co/beats/filebeat:7.10.0 \
-E "output.elasticsearch.hosts=["elasticsearch:9200"]"
```

## k6

```
docker run --name k6 --net canary -i --rm -e K6_STATSD_ADDR=filebeat:8125 loadimpact/k6 run - < testCases/k6ioWMStages.js --out statsd
```

