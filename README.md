# k6.io — Training Repository

Repozitář s příklady a demo prostředím pro školení k6.io load testingu.

---

## Struktura repozitáře

```
k6/
├── demos/
│   ├── 01-sandbox/          # Základní šablony a příklady
│   ├── 02-examples/         # Feature-specific příklady
│   ├── executors/           # Ukázky všech executor typů
│   ├── features/            # Pokročilé k6 funkce (metrics, checks, browser…)
│   ├── kafka-stack/         # Kompletní Kafka + Prometheus + Grafana stack
│   └── protobuf/            # Protocol Buffers příklady
├── build/                   # Pre-built k6 binaries s extensions
│   ├── k6/                  # Vanilla k6
│   ├── k6-prom/             # k6 + xk6-prometheus HTTP exporter
│   ├── k6-kafka/            # k6 + xk6-kafka
│   └── k6-sql-prom/         # k6 + SQL + Prometheus
├── prometheus/              # Prometheus konfigurace
├── grafana/                 # Grafana dashboardy (JSON export)
└── k8s/                     # Kubernetes manifesty
```

---

## Quickstart

### Prerekvizity

```bash
# Volitelně — správa ENV proměnných
brew install direnv
eval "$(direnv hook zsh)"
```

### Příklad `.envrc`

```bash
export ENVIRONMENT=http://localhost/
export USER=ABC
export PASS=XYZ
export TEST_PLAN_NAME=demos/01-sandbox/00-template.js
export GIT_TEST_REPOSITORY=https://github.com/rdpanek/k6.git
export GIT_REVISION=ce9ce3b
export TRACE_ID=00000000000000000000000000000000
```

```bash
direnv allow .
```

---

## Spuštění testů

### Lokálně

```bash
k6 run demos/01-sandbox/00-template.js
```

### Docker — vanilla k6

```bash
docker run --name k6 -it --rm \
  -v $(pwd)/demos:/home/k6/tests/demos \
  --net k6 \
  -e TEST_PLAN_NAME=demos/01-sandbox/00-template.js \
  grafana/k6:latest
```

### Docker — k6 s Prometheus HTTP exporterem

```bash
docker run --name k6 --rm -it \
  -v $(pwd)/demos:/home/k6/tests/demos \
  --net k6 \
  -p 5656:5656 \
  -e TEST_PLAN_NAME=demos/01-sandbox/04-prometheus.js \
  ghcr.io/rdpanek/k6:prom.latest \
  --out prometheus=namespace=k6
```

### Docker — k6 s Prometheus Remote Write

```bash
docker run --name k6 --rm -it \
  --net k6 \
  -v $(pwd)/demos:/home/k6/tests/demos \
  -e TEST_PLAN_NAME=demos/01-sandbox/04-prometheus.js \
  -e K6_PROMETHEUS_RW_SERVER_URL=http://prometheus:9090/api/v1/write \
  ghcr.io/rdpanek/k6:prom.latest \
  -o experimental-prometheus-rw
```

### Docker — clone git repozitáře + spuštění

```bash
docker run --name k6 -it --rm \
  --net k6 \
  -e GIT_TEST_REPOSITORY=https://github.com/rdpanek/k6.git \
  -e GIT_REVISION=0a36a87 \
  -e TEST_PLAN_NAME=demos/01-sandbox/04-prometheus.js \
  ghcr.io/rdpanek/k6:prom.latest \
  -o experimental-prometheus-rw
```

---

## Prometheus + Grafana + k6

Kompletní monitoring stack pro PRW (Prometheus Remote Write) s Native Histograms.

### Spuštění

```bash
# 1. Síť
docker network create k6

# 2. Prometheus — remote write + native histograms
docker run -d --name prometheus --net k6 \
  -p 9090:9090 \
  -v $(pwd)/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro \
  prom/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --web.enable-remote-write-receiver \
  --enable-feature=native-histograms,exemplar-storage \
  --storage.tsdb.path=/prometheus \
  --web.enable-lifecycle

# 3. Grafana
docker run -d --rm --net k6 --name grafana -p 3000:3000 grafana/grafana

# 4. k6 test
docker run --name k6 --net k6 -it --rm \
  -v $(pwd)/demos:/home/k6/tests/demos \
  -e ENVIRONMENT=$ENVIRONMENT \
  -e TEST_PLAN_NAME=demos/01-sandbox/04-prometheus.js \
  -e K6_PROMETHEUS_RW_SERVER_URL=http://prometheus:9090/api/v1/write \
  -e K6_PROMETHEUS_RW_PUSH_INTERVAL=5s \
  -e K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true \
  ghcr.io/rdpanek/k6:prom.latest \
  -o experimental-prometheus-rw \
  --summary-mode=disabled \
  --no-thresholds \
  --verbose
```

### URLs

| Služba     | URL                        | Login         |
|------------|----------------------------|---------------|
| Grafana    | http://localhost:3000      | anon/Admin    |
| Prometheus | http://localhost:9090      | —             |
| k6 metrics | http://localhost:6565      | —             |

### Grafana — import dashboardu

1. Otevři http://localhost:3000
2. Connections → Data sources → Add → Prometheus → URL: `http://prometheus:9090`
3. Dashboards → Import → nahrát JSON z `grafana/` adresáře

---

## Kafka Stack

Kompletní Kafka demo environment s Prometheus + Grafana monitoringem.

```bash
cd demos/kafka-stack
docker compose up
```

| Služba          | URL                   |
|-----------------|-----------------------|
| Kafka UI        | http://localhost:8080 |
| Prometheus      | http://localhost:9090 |
| Grafana         | http://localhost:3000 |
| REST Proxy      | http://localhost:8082 |

---

## BattlePage (demo web app)

```bash
docker network create k6
docker run -d --rm -p 80:80 -p 443:443 --net k6 --name battle \
  quay.io/canarytrace/battle-page:1.3
```

---

## Build vlastního k6 s extensions

```bash
# xk6-prometheus HTTP exporter
xk6 build --with github.com/szkiba/xk6-prometheus@latest

# Docker (linux)
docker run --rm -it -u "$(id -u):$(id -g)" \
  -v "${PWD}:/k6" grafana/xk6 build \
  --with github.com/szkiba/xk6-prometheus@latest
```

---

## Klíčové demo soubory

| Soubor | Popis |
|--------|-------|
| `demos/01-sandbox/00-template.js` | Minimální šablona |
| `demos/01-sandbox/01-web-service-basics.js` | HTTP GET, VU koncept |
| `demos/01-sandbox/02-web-service-stages.js` | Ramp-up/down stages |
| `demos/01-sandbox/04-prometheus.js` | Prometheus, custom metrics, multi-scenario |
| `demos/executors/` | Všechny typy executorů (shared-iterations → ramping-arrival-rate) |
| `demos/features/checks.js` | Response validace |
| `demos/features/metrics-*.js` | Counter, Gauge, Rate, Trend |
| `demos/features/thresholds*.js` | Pass/fail kritéria |
| `demos/features/browser.js` | Browser automation |

---

## PromQL — rychlý přehled

```promql
# 95. percentil latence (ms)
k6_http_req_duration{quantile="0.95"}

# Průměrný duration
avg(k6_http_req_duration)

# Počet requestů za minutu
rate(k6_http_reqs[1m])

# Native histogram — p95 latence v ms
histogram_quantile(0.95,
  sum by (le) (
    rate(k6_http_req_duration_seconds[1m])
  )
) * 1000
```
