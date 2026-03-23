#!/bin/sh
# k6 with Prometheus metrics scrape endpoint (xk6-prometheus).
#
# Usage:
#   # Run test and expose Prometheus metrics on :5656/metrics
#   docker run --rm -v $(pwd):/work -p 5656:5656 \
#     ghcr.io/rdpanek/k6:prom.latest \
#     run --out prometheus /work/test.js
#
#   # Scrape endpoint configuration (env vars for xk6-prometheus):
#   K6_PROMETHEUS_NAMESPACE   — metric name prefix (default: k6)
#   K6_PROMETHEUS_SUBSYSTEM   — metric subsystem prefix (default: "")
#   K6_PROMETHEUS_ADDR        — listen address (default: 0.0.0.0:5656)
#
# Optional CI/CD env vars (git clone mode):
#   GIT_TEST_REPOSITORY — clone this repo into K6_HOME before running
#   GIT_REVISION        — branch or commit to checkout
#   TEST_PLAN_NAME      — script path relative to K6_HOME (default: baseline.js)
#   ENV_PRINT           — set to "allow" to print all env vars on startup
#   STOP_AFTER_TEST     — set to "allow" to sleep 1h after test (debug)

set -e

if [ "${ENV_PRINT}" = "allow" ]; then
  echo "[entrypoint] Environment variables:"
  env | sort
fi

# Git clone mode: pull test repository at runtime
if [ -n "${GIT_TEST_REPOSITORY}" ]; then
  echo "[entrypoint] Cloning test repository: ${GIT_TEST_REPOSITORY}"
  cd "${K6_HOME}"
  git clone "${GIT_TEST_REPOSITORY}" "${K6_HOME}"
  if [ -n "${GIT_REVISION}" ]; then
    git fetch && git checkout "${GIT_REVISION}"
  fi
fi

# Direct invocation mode: pass all arguments through to k6
# Example: docker run image run /work/test.js --out prometheus
exec k6 "$@"
