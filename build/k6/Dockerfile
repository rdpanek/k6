FROM grafana/k6:0.37.0

USER root
ENV K6_HOME /home/k6

COPY entrypoint.sh /
RUN chmod -R a+rwX $K6_HOME && \
    apk add git

# install support for aws cli
RUN apk add --no-cache \
    python3 \
    py3-pip \
    && pip3 install --upgrade pip \
    && pip3 install \
    awscli \
    && rm -rf /var/cache/apk/* \
    && aws --version

WORKDIR $K6_HOME
ENTRYPOINT ["/entrypoint.sh"]