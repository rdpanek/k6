FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

# tig - jednoduchý apt install
RUN apt-get update && apt-get install -y tig && rm -rf /var/lib/apt/lists/*

# k6
RUN curl -fsSL https://pkg.grafana.com/gpg.key | gpg --dearmor -o /usr/share/keyrings/grafana.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/grafana.gpg] https://pkg.grafana.com/oss/deb stable main" \
    > /etc/apt/sources.list.d/grafana.list \
    && apt-get update && apt-get install -y k6 && rm -rf /var/lib/apt/lists/*

# k9s
RUN curl -fsSL https://github.com/derailed/k9s/releases/latest/download/k9s_Linux_amd64.tar.gz \
    | tar -xz -C /usr/local/bin k9s
