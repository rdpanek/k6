FROM ghcr.io/grafana/xk6:0.20.1

USER root
ENV K6_HOME /home/k6

COPY entrypoint.sh /
RUN mkdir -p $K6_HOME && \
    chmod -R a+rwX $K6_HOME && \
    # install dependencies
    apk add --no-cache \
    git \
    wget && \
    # setup go environment
    go mod init xk6-module && \
    # install xk6-prometheus
    xk6 build --with github.com/mostafa/xk6-kafka@latest && \
    mv ./k6 /usr/local/bin/k6

WORKDIR $K6_HOME
ENTRYPOINT ["/entrypoint.sh"]