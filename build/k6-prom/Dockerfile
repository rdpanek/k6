# =============================================================================
# Stage 1: Build k6 with xk6-prometheus extension
#
# Uses Go 1.26 (required by xk6 >= v1.3 / k6foundry).
# xk6 is installed from source, then used to compile k6 + extension.
# Result: k6 binary with built-in Prometheus scrape endpoint on /metrics.
# =============================================================================
FROM golang:1.26-alpine AS builder

RUN apk add --no-cache git ca-certificates

# Install xk6 build tool (latest, compatible with Go 1.26)
RUN go install go.k6.io/xk6/cmd/xk6@latest

# Build k6 with xk6-prometheus extension
# Pins to v0.3.0 — last tested compatible version with k6 v1.6.x
WORKDIR /build
RUN go mod init xk6-build && \
    xk6 build \
        --with github.com/szkiba/xk6-prometheus@v0.3.0 \
        --output /k6

# =============================================================================
# Stage 2: Minimal runtime image (multi-platform: amd64 + arm64)
# =============================================================================
FROM alpine:3.21

RUN apk add --no-cache ca-certificates tzdata git wget

# Copy compiled k6 binary from builder stage
COPY --from=builder /k6 /usr/local/bin/k6

# Copy entrypoint script
COPY build/k6-prom/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV K6_HOME=/home/k6

RUN mkdir -p ${K6_HOME} && \
    chmod -R a+rwX ${K6_HOME}

WORKDIR ${K6_HOME}
ENTRYPOINT ["/entrypoint.sh"]
