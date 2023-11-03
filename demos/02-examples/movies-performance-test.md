# Movies & Elasticsearch (API)

### Zadání
Potřebuješ nasadit Elasticsearch pro společnost, která se zabývá hodnocením filmů. Tvým úkolem je otestovat nasazení Elasticsearch a usecase se zapisováním filmů.

**NFR**
- Zadávání filmů a hodnocení
	- Do Elasticsearch se bude zapisovat v peaku maximálně 50 filmů za minutu.
	- Ke každému filmu veřejnost přidávat hodnocení, maximálně 100 hodnocení za minutu. Ukázku najdeš na konci zadání.
		- Každý film a má své unikátní ID a hodnocení používá ID filmu, takže k testovacím datům je potřeba přidat `movie_id`
- Obecně chceme aby REST-API Elasticsearch odpovídal vždy maximálně do 200ms.
- Chybovost maximálně 1%
- TestCase poběží 5minut.

**Ostatní požadavky**
- Všechny hodnoty v testu (konfigurace) musí být parametrizovatelný.

**Jak udělat**
- ID filmu může být unikátní a nebo můžete použít čítač
- Hodnocení filmu využijte další scénář.
- Použijte tags, groups a thresholdy - cílem je umět zhodnotit, zdali test dokáže vyhodnotit NFR.
- Použijte countery pro počítadlo chyb, test by měl mít threshold na počet úspěšně uložených filmů. 

Dostal jsi základní nedodělaný test:
- Nahraje 4 dokumenty (záznamy o filmech) do Elasticsearch do indexu `movies` a ověří `response code` a `response message`.
- Vypíše všechny záznamy v indexu `movies` a ověří `response code` a `docs.count` který musí mít hodnotu 4.
- V `setup` zjistí jestli index existuje a pokud ano, odstraní jej.
Pokračování:
- Refaktoring, rev: `2a26c85`
	- data umístit do externího souboru a v setupu načítat.
	- práci s Elasticsearch přemístit do vlastního fragmentu a z hlavního skriptu volat tento fragment a v něm umístěné funkce, které zapouzdřují volání s Elasticsearch.
	- Přidat parametrizaci (environment variables) pro:
		- uri Elasticsearch
		- název indexu
 
**Hodnocení výsledků**
- Připrav si manažerské shrnutí s informací, jak test dopadl (ústně)
- Funkční test společně s instrukcemi jak jej spustit pushni do vlastního Git repozitáře na Githubu


### Prerekvizity

**Spuštění Elasticsearch v Dockeru**

- Možná budeš mít problém se spuštěním v CodeSpaces, protože Elasticsearch potřebuje dostatek paměti a CPU.
- Pokud máš problém, tak zkus spustit Elasticsearch v Dockeru s omezenými prostředky (viz níže).
- Nebo spusť Codespace se 4vCPU a 16GB RAM. (30 hours free /month)

```bash
docker run --name elasticsearch --rm -d -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e ES_SETTING_XPACK_SECURITY_ENABLED=false -e ES_SETTING_ACTION_DESTRUCTIVE__REQUIRES__NAME=false docker.elastic.co/elasticsearch/elasticsearch:8.4.1 bin/elasticsearch -Enetwork.host=0.0.0.0
```

Úspornější Elasticsearch
- snížení CPU na `0.5` core
```bash
docker run --name elasticsearch --rm -d -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e ES_SETTING_XPACK_SECURITY_ENABLED=false -e ES_SETTING_ACTION_DESTRUCTIVE__REQUIRES__NAME=false --cpus=".5" -m="1g" docker.elastic.co/elasticsearch/elasticsearch:8.4.1 bin/elasticsearch -Enetwork.host=0.0.0.0
```

- pro aktuální spotřebu prostředků můžete použít `docker stats`.
- pokud to bude potřeba, můžete Elasticsearch zastavit `docker kill elasticsearch`, navýšit parametr `--cpus` třeba na jeden core `--cpus="1"` a Elasticsearch znovu spustit.

**Log**

Pokud budeš mít problém se spuštěním Elasticsearch, podívej se do logu co to píše
```bash
docker logs -f elasticsearch
```

**Ověření, že Elasticsearch běží**
```bash
curl localhost:9200
...
{
  "name" : "ded91c77115c",
  "cluster_name" : "docker-cluster",
  "cluster_uuid" : "CRI-afKzSz6j8PgYlssdUg",
  "version" : {
    "number" : "8.4.1",
    "build_flavor" : "default",
    "build_type" : "docker",
    "build_hash" : "2bd229c8e56650b42e40992322a76e7914258f0c",
    "build_date" : "2022-08-26T12:11:43.232597118Z",
    "build_snapshot" : false,
    "lucene_version" : "9.3.0",
    "minimum_wire_compatibility_version" : "7.17.0",
    "minimum_index_compatibility_version" : "7.0.0"
  },
  "tagline" : "You Know, for Search"
}
```

**Ukázka hodnocení**
```javascript
const fanReview = {
  movie_title: 'Iron Man',
  review_date: '2022-01-01',
  fan_name: 'John Doe',
  fan_review: 'Great movie! I really enjoyed the performance of Robert Downey Jr.',
  fan_rating: 8.5,
}
```
