#!/bin/sh
# k6 with Prometheus metrics scrape endpoint (xk6-prometheus).
#
# Modes of operation:
#
# 1. Git clone mode (CI/CD):
#    Repo is cloned into /home/k6/tests at runtime, k6 runs from there.
#
#    docker run --rm -p 5656:5656 \
#      -e GIT_TEST_REPOSITORY=https://github.com/org/repo.git \
#      -e GIT_REVISION=main \
#      -e TEST_PLAN_NAME=./demos/01-sandbox/04-prometheus.js \
#      ghcr.io/rdpanek/k6:prom.latest \
#      --out prometheus=namespace=k6
#
# 2. Volume mount mode (local dev):
#    Mount your demos dir to /home/k6/tests/demos; set TEST_PLAN_NAME.
#
#    docker run --rm -p 5656:5656 \
#      -v $(pwd)/demos:/home/k6/tests/demos \
#      -e TEST_PLAN_NAME=demos/01-sandbox/04-prometheus.js \
#      ghcr.io/rdpanek/k6:prom.latest \
#      --out prometheus=namespace=k6
#
# 3. Direct mode (full explicit command):
#    docker run --rm -v $(pwd):/work \
#      ghcr.io/rdpanek/k6:prom.latest \
#      run /work/test.js --out prometheus=namespace=k6
#
# Optional env vars:
#   ENV_PRINT=allow       — print all env vars on startup (debug)
#   STOP_AFTER_TEST=allow — sleep 1h after test finishes (debug)
#
# xk6-prometheus scrape endpoint env vars:
#   K6_PROMETHEUS_NAMESPACE   — metric name prefix (default: k6)
#   K6_PROMETHEUS_SUBSYSTEM   — metric subsystem prefix (default: "")
#   K6_PROMETHEUS_ADDR        — listen address (default: 0.0.0.0:5656)

set -e

if [ "${ENV_PRINT}" = "allow" ]; then
  echo "[entrypoint] Environment variables:"
  env | sort
fi

# Git clone mode: clone repo into ${K6_HOME}/tests so paths are consistent
# with volume mount mode (both run k6 from /home/k6/tests).
if [ -n "${GIT_TEST_REPOSITORY}" ]; then
  echo "[entrypoint] Cloning: ${GIT_TEST_REPOSITORY}"
  rm -rf "${K6_HOME}/tests"
  git clone "${GIT_TEST_REPOSITORY}" "${K6_HOME}/tests"
  if [ -n "${GIT_REVISION}" ]; then
    echo "[entrypoint] Checking out: ${GIT_REVISION}"
    cd "${K6_HOME}/tests"
    git fetch && git checkout "${GIT_REVISION}"
  fi
fi

# TEST_PLAN_NAME mode: run from /home/k6/tests so relative paths resolve
# correctly for both git clone and volume mount.
if [ -n "${TEST_PLAN_NAME}" ]; then
  cd "${K6_HOME}/tests"
  exec k6 run "${TEST_PLAN_NAME}" "$@"
fi

# Direct mode: pass full command through to k6
# e.g. docker run image run /work/test.js --out prometheus
exec k6 "$@"
