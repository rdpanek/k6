# Kafka demo prostředí pro k6 soak testy

Kompletní lokální stack pro spuštění k6 zátěžového testu na Kafka REST Proxy.
Připraveno pro test [`11-kafka-8h-soak.js`](../executors/11-kafka-8h-soak.js).

---

## Co stack obsahuje

| Kontejner | Port | Popis |
|-----------|------|-------|
| **Kafka REST Proxy** | `8082` | Cíl k6 testu — HTTP přístup ke Kafce |
| **Schema Registry** | `8081` | Validace Avro/JSON schémat |
| **Kafka broker** | `9092` | Jádro brokerů (interní + hostitelský přístup) |
| **ZooKeeper** | _(interní)_ | Koordinace brokerů (Confluent Platform) |
| **Kafka UI** | `8080` | Webové rozhraní — topiky, zprávy, consumer groups |
| **kafka-exporter** | `9308` | Prometheus metriky Kafka brokeru |
| **Prometheus** | `9090` | Sběr a ukládání metrik |
| **Grafana** | `3000` | Dashboardy — přihlášení `admin` / `admin` |

Po spuštění `kafka-init` kontejner automaticky vytvoří všech **6 topiků**:

| Topik | Oddíly | Retence |
|-------|--------|---------|
| `ecommerce.orders.v1` | 3 | 1 h |
| `ecommerce.payments.v1` | 3 | 1 h |
| `ecommerce.inventory.v1` | 3 | 1 h |
| `ecommerce.notifications.v1` | 3 | 1 h |
| `ecommerce.orders.dlq` | 1 | 24 h |
| `ecommerce.payments.dlq` | 1 | 24 h |

---

## Požadavky

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) nebo Docker Engine + Docker Compose v2
- Doporučená RAM: **alespoň 4 GB** přidělené Dockeru (Confluent Platform je náročný na paměť)
- k6 nainstalovaný lokálně nebo přes Docker (viz [tools/k6-load-preview.md](../../tools/k6-load-preview.md))

---

## Spuštění

### 1. Spusť stack

```bash
cd demos/kafka-stack
docker compose up -d
```

Docker stáhne images a nastartuje všechny kontejnery. První spuštění trvá
2–3 minuty (stahování images + start Kafky).

### 2. Ověř, že vše běží

```bash
docker compose ps
```

Všechny klíčové kontejnery mají mít stav `healthy`:

```
NAME                       STATUS
k6-kafka-zookeeper         Up (healthy)
k6-kafka-broker            Up (healthy)
k6-kafka-schema-registry   Up (healthy)
k6-kafka-rest              Up (healthy)
k6-kafka-ui                Up
k6-kafka-exporter          Up
k6-prometheus              Up
k6-grafana                 Up
```

### 3. Ověř REST Proxy

```bash
# Seznam topiků (musí vrátit 6 ecommerce.* topiků)
curl http://localhost:8082/topics

# Test produce — odeslání zprávy do topiku objednávek
curl -X POST http://localhost:8082/topics/ecommerce.orders.v1 \
  -H 'Content-Type: application/vnd.kafka.json.v2+json' \
  -H 'Accept: application/vnd.kafka.v2+json' \
  -d '{"records":[{"key":"test-order","value":{"orderId":"test-1","status":"CREATED"}}]}'
```

---

## Spuštění k6 testu

### Lokálně nainstalované k6

```bash
# Z kořenového adresáře repozitáře
k6 run demos/executors/11-kafka-8h-soak.js
```

### Přes Docker (bez instalace k6)

```bash
docker run --rm \
  --network kafka-stack_default \
  -e KAFKA_REST_PROXY=http://kafka-rest:8082 \
  -e SCHEMA_REGISTRY=http://schema-registry:8081 \
  -v $(pwd):/work \
  ghcr.io/rdpanek/k6:kafka.latest \
  run /work/demos/executors/11-kafka-8h-soak.js
```

> Při spuštění přes Docker je nutné použít interní Docker síť (`kafka-stack_default`)
> a interní hostname kontejnerů (`kafka-rest`, `schema-registry`) místo `localhost`.

### Zkrácený test (pouze smoke — bez 8h čekání)

8hodinový test lze zkrátit přepsáním délky v CLI, ale protože skript používá
pojmenované scénáře, je jednodušší ho spustit a po ověření funkčnosti přerušit:

```bash
# Spusť, nechej běžet ~1 minutu a ukonči pomocí Ctrl+C
k6 run demos/executors/11-kafka-8h-soak.js
```

---

## Přehled rozhraní

### Kafka UI — http://localhost:8080

Webové rozhraní pro správu a monitoring Kafky:
- přehled topiků a jejich konfigurací
- prohlížení zpráv v topicích (přehraj produce z testu)
- consumer groups a consumer lag
- Schema Registry — přehled schémat

### Prometheus — http://localhost:9090

Průzkumník metrik. Užitečné dotazy:

```promql
# Počet zpráv v topiku (podle oddílu)
kafka_topic_partition_current_offset{topic="ecommerce.orders.v1"}

# Consumer lag podle skupiny
kafka_consumergroup_lag

# Počet offline replik (měl by být 0)
kafka_brokers{state="offline"}
```

### Grafana — http://localhost:3000

Přihlášení: `admin` / `admin`

Prometheus datasource je předkonfigurovaný automaticky.

**Doporučené dashboardy k importu:**

| Dashboard | ID | Popis |
|-----------|-----|-------|
| Kafka Exporter Overview | `7589` | Přehled brokeru, topiků, consumer lag |
| Kafka Overview | `721` | Alternativní přehled |

Jak importovat dashboard:
1. Grafana → **Dashboards** → **Import**
2. Zadej ID dashboardu (např. `7589`)
3. Vyber datasource **Prometheus**
4. Potvrď **Import**

---

## Architektura stacku

```
k6 test
  │
  ├─► REST Proxy (8082) ──────────────► Kafka broker (29092 interní)
  │                                          │
  ├─► Schema Registry (8081) ───────────────►│ (schema topic)
  │                                          │
  └─► topic metadata (GET /topics/…)         ▼
                                       ZooKeeper (2181)

Monitoring:
  Kafka broker ──► kafka-exporter (9308) ──► Prometheus (9090) ──► Grafana (3000)
```

**Poznámka k sítím:**
- Kafka broker naslouchá na dvou listenerech:
  - `PLAINTEXT://kafka:29092` — interní Docker síť (pro REST Proxy, Schema Registry)
  - `PLAINTEXT_HOST://localhost:9092` — přístup z hostitele (pro přímé Kafka klienty)

---

## Zastavení a úklid

```bash
# Zastav kontejnery (data zůstanou v volumes)
docker compose stop

# Zastav a odstraň kontejnery
docker compose down

# Zastav, odstraň kontejnery i data (volumes)
docker compose down -v
```

---

## Řešení problémů

### Kontejner ZooKeeper je `unhealthy`

Healthcheck používá `cub zk-ready` (Confluent Utility Belt, součást cp-* image).
Pokud selhává, zkontroluj logy:

```bash
docker compose logs zookeeper
```

ZooKeeper potřebuje ~15 sekund na start. Ostatní kontejnery čekají na jeho healthcheck.

### Kafka broker se nespustí / stav `starting`

Kafka se připojuje k ZooKeeperu. Pokud ZooKeeper ještě není připraven, Kafka
zopakuje pokus. Stav `starting` po dobu 30–60 sekund je normální.

```bash
docker compose logs kafka
```

### REST Proxy vrací 406 Not Acceptable

Správný `Accept` header pro topic metadata endpoint:
```
Accept: application/vnd.kafka.v2+json
```
(Ne `application/vnd.kafka.json.v2+json` — to je pro consumer record payloady.)

### Nedostatek paměti

Confluent Platform vyžaduje ~2,5 GB RAM. Pokud Docker nemá dost paměti:
- macOS/Windows: Docker Desktop → Settings → Resources → Memory → nastav alespoň 4 GB
- Linux: zkontroluj dostupnou RAM pomocí `free -h`

---

## Autor

**Radim Daniel Pánek** — [rdpanek@canarytrace.com](mailto:rdpanek@canarytrace.com)
[k6.canarytrace.com](https://k6.canarytrace.com)
