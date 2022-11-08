FROM golang:1.18rc1-alpine3.14

USER root
ENV K6_HOME /home/k6

COPY entrypoint.sh /
RUN mkdir $K6_HOME && \
    chmod -R a+rwX $K6_HOME && \

    # install dependencies
    apk add --no-cache \
    git \
    wget \

    # install support for aws cli
    python3 \
    py3-pip \
    && pip3 install --upgrade pip \
    && pip3 install \
    awscli \
    && rm -rf /var/cache/apk/* \
    && aws --version && \

    # install xk6 and budild with prometheus module
    # install xk6
    cd /opt && \
    wget https://github.com/grafana/xk6/releases/download/v0.7.0/xk6_0.7.0_linux_amd64.tar.gz && \
    tar -xvzf xk6_0.7.0_linux_amd64.tar.gz && \
    
    # build sql & prom module
    ./xk6 build --with github.com/grafana/xk6-output-prometheus-remote@latest && \
    rm -rf xk6_0.7.0_linux_amd64.tar.gz xk6 LICENSE README.md && \
    ln -s /opt/k6 /usr/bin/k6

WORKDIR $K6_HOME
ENTRYPOINT ["/entrypoint.sh"]