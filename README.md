# k6.io
> https://k6.io/ Open source load testing tool and SaaS for engineering teams.
- https://github.com/grafana/k6/releases release notes.
- https://hub.docker.com/r/grafana/k6/tags Docker images. 

# How to get
- `docker pull loadimpact/k6` or for OSX
- `brew install k6`

## Prerequisites for development

1). Install k6.io locally - better for debugging

2). Install https://direnv.net/ for ENV management

Example of .envrc
```
export TRACE_ID=4346a6987e64b4affc69352e83aed2a3
export POD_TOTAL=10
export POD_ID=0
export ENVIRONMENT=http://example.com/
export USER=ABC
export PASS=XYZ
```
and allow config via `eval "$(direnv hook zsh)"`

# How To Run
- `k6 run boilerplate/baseline.js` or
- `docker run --name k6 -i --rm -v $(pwd):/home/k6/ -e ENVIRONMENT=$ENVIRONMENT grafana/k6:0.37.0 run boilerplate/baseline.js --no-usage-report`

### How to run with clone public git repository with tests**
> this command download repository, checkout on revision and run k6
- `docker run --name k6 -it --rm -e GIT_TEST_REPOSITORY=https://github.com/rdpanek/k6.git -e GIT_REVISION=ce9ce3b -e TEST_PLAN_NAME=baseline.js quay.io/rdpanek/k6:1.0.1`

## Checkout latest version
https://quay.io/repository/rdpanek/k6?tab=tags


**ENV for clone repository with tests and run k6**

- `GIT_TEST_REPOSITORY` e.g. https://github.com/rdpanek/k6.git
- `GIT_REVISION` e.q. `ce9ce3b`
- `TEST_PLAN_NAME` e.q. `baseline.js`, default is `baseline.js`
- `TRACE_ID` must be any string of 32 characters. Default is `00000000000000000000000000000000`

# How to run in k8s

- create namespace `kubectl create namespace k6`
- update count of replicas in `k8s/deployment.yaml`


# Convert HAR to K6 test
`k6 convert -O elasticsearch/syntexHomePage.js /Users/rdpanek/HTDOCS/teststack/k6/elasticsearch/har/www.syntex.cz.har`



## Prometheus & Grafana

0). Run test web
```bash
docker run -d --rm -p 80:80 -p 443:443 --net k6 --name battle quay.io/canarytrace/battle-page:1.1
```


1). Build k6 with xk6-prometheus

- https://github.com/szkiba/xk6-prometheus
  - Build or download https://github.com/k6io/xk6/releases

```bash
# build
./xk6_0.4.1_mac_amd64/xk6 build --with github.com/szkiba/xk6-prometheus@latest
```

2). Run k6 with prometheus module

```bash
./k6 run baseline.js --out 'prometheus=namespace=k6' --no-usage-report
```

3). endpoint `/metrics` are available on `5656` port

- http://localhost:5656/metrics

4). prepare Prometheus configuration

- `prometheus/prometheus.yml`

5). run Prometheus

```bash
docker run --name prometheus --net k6 -d --rm -v $(PWD)/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml -p 9090:9090 prom/prometheus
```

and check that target k6 us up http://localhost:9090/targets

6). Run Grafana

```bash
docker run -d --rm --net k6 --name grafana -p 3000:3000 grafana/grafana
```

7). Login to Grafana and import dashboard

- http://localhost:3000/
- import dashboard from `grafana/` directory

## K6 with prometheus

1). Build
```bash
docker build -t quay.io/rdpanek/k6:0.33.0-prometheus -f Dockerfile-prometheus .
```

2). Run from localhost with prometheus HTTP exporter

```bash
docker run --name k6 --rm -it -v $(pwd):/opt --net k6 -p 5656:5656 -e TEST_PLAN_NAME=baseline.js quay.io/rdpanek/k6:0.33.0-prometheus
```

3). Run with Prometheus HTTP exporter
```bash
docker run --name k6 --rm -it --net k6 -e GIT_TEST_REPOSITORY=https://github.com/rdpanek/k6.git -e GIT_REVISION=64cd2431df27af82ddd6a0b07c59e1d0ea599b73 -p 5656:5656 quay.io/rdpanek/k6:0.33.0-prometheus
```