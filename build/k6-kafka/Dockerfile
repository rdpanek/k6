# =============================================================================
# Stage 1: Build k6 with xk6-kafka extension
#
# Uses Go 1.26 (required by xk6-kafka >= v1.2.0).
# xk6 is installed from source, then used to compile k6 + extension.
# =============================================================================
FROM golang:1.26-alpine AS builder

RUN apk add --no-cache git ca-certificates

# Install xk6 build tool
RUN go install go.k6.io/xk6/cmd/xk6@latest

# Build k6 with xk6-kafka extension
WORKDIR /build
RUN go mod init xk6-build && \
    xk6 build \
        --with github.com/mostafa/xk6-kafka@v1.2.0 \
        --output /k6

# =============================================================================
# Stage 2: Minimal runtime image
# =============================================================================
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata git wget

# Copy k6 binary from builder
COPY --from=builder /k6 /usr/local/bin/k6

# Copy entrypoint script (from repo root — build context is '.')
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV K6_HOME=/home/k6

RUN mkdir -p ${K6_HOME} && \
    chmod -R a+rwX ${K6_HOME}

WORKDIR ${K6_HOME}
ENTRYPOINT ["/entrypoint.sh"]
