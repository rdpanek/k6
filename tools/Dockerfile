# ── Stage 1: build k6-load-preview binary ─────────────────────────────────────────
FROM golang:1.22-alpine AS builder

WORKDIR /src
COPY tools/k6-load-preview.go .
RUN go build -ldflags="-s -w" -o k6-load-preview k6-load-preview.go

# ── Stage 2: runtime — grafana/k6 base + k6-load-preview binary ───────────────────
# grafana/k6 already contains the k6 binary (required by k6-load-preview for
# `k6 inspect`). We just add our compiled binary on top.
FROM grafana/k6:latest

USER root
COPY --from=builder /src/k6-load-preview /usr/local/bin/k6-load-preview
RUN chmod +x /usr/local/bin/k6-load-preview

# Mount your k6 project directory to /work at runtime:
#   docker run --rm -v $(pwd):/work ghcr.io/rdpanek/k6:load-preview.latest <script.js> [options]
WORKDIR /work
ENTRYPOINT ["k6-load-preview"]
