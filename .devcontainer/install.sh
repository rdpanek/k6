#!/bin/bash
set -euo pipefail

sudo apt-get update && sudo apt-get install -y tig

# k6
curl -fsSL https://github.com/grafana/k6/releases/download/v1.6.1/k6-v1.6.1-linux-amd64.tar.gz -o /tmp/k6.tar.gz
sudo tar -xz --strip-components=1 -C /usr/local/bin -f /tmp/k6.tar.gz k6-v1.6.1-linux-amd64/k6
rm /tmp/k6.tar.gz

# k9s
curl -fsSL https://github.com/derailed/k9s/releases/latest/download/k9s_Linux_amd64.tar.gz -o /tmp/k9s.tar.gz
sudo tar -xz -C /usr/local/bin -f /tmp/k9s.tar.gz k9s
rm /tmp/k9s.tar.gz

# xk6
curl -fsSL https://github.com/grafana/xk6/releases/download/v1.3.4/xk6_1.3.4_linux_amd64.tar.gz -o /tmp/xk6.tar.gz
sudo tar -xz -C /usr/local/bin -f /tmp/xk6.tar.gz xk6
rm /tmp/xk6.tar.gz

# kubectl
KUBECTL_VERSION=$(curl -Ls https://dl.k8s.io/release/stable.txt)
curl -fsSL "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl" -o /tmp/kubectl
sudo mv /tmp/kubectl /usr/local/bin/kubectl
sudo chmod +x /usr/local/bin/kubectl
