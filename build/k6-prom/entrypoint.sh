#!/bin/sh
# k6 with Prometheus metrics scrape endpoint (xk6-prometheus).
#
# Modes of operation:
#
# 1. TEST_PLAN_NAME mode (CI/CD, legacy):
#    Set TEST_PLAN_NAME env var; extra docker CMD args are appended to k6 run.
#
#    docker run --rm -p 5656:5656 \
#      -v $(pwd)/demos:/home/k6/tests/demos \
#      -e TEST_PLAN_NAME=demos/01-sandbox/04-prometheus.js \
#      ghcr.io/rdpanek/k6:prom.latest \
#      --out prometheus=namespace=k6
#    → runs: k6 run demos/01-sandbox/04-prometheus.js --out prometheus=namespace=k6
#
# 2. Direct mode (explicit full command):
#    Pass the full k6 command as docker CMD args.
#
#    docker run --rm -p 5656:5656 \
#      -v $(pwd):/work \
#      ghcr.io/rdpanek/k6:prom.latest \
#      run /work/test.js --out prometheus=namespace=k6
#
# Optional env vars:
#   GIT_TEST_REPOSITORY — git clone this URL into K6_HOME before running
#   GIT_REVISION        — branch or commit to checkout after clone
#   ENV_PRINT=allow     — print all env vars on startup (debug)
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

# Optional: git clone test repository at runtime
if [ -n "${GIT_TEST_REPOSITORY}" ]; then
  echo "[entrypoint] Cloning: ${GIT_TEST_REPOSITORY}"
  cd "${K6_HOME}"
  git clone "${GIT_TEST_REPOSITORY}" "${K6_HOME}"
  if [ -n "${GIT_REVISION}" ]; then
    git fetch && git checkout "${GIT_REVISION}"
  fi
fi

# TEST_PLAN_NAME mode: env var defines the script, $@ are extra k6 flags
if [ -n "${TEST_PLAN_NAME}" ]; then
  exec k6 run "${TEST_PLAN_NAME}" "$@"
fi

# Direct mode: full command passed as docker CMD (e.g. run /work/test.js --out prometheus)
exec k6 "$@"
