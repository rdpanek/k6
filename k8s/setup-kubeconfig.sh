#!/bin/bash
nano /workspaces/k6/kubeconfig.yaml
export KUBECONFIG=/workspaces/k6/kubeconfig.yaml
echo 'export KUBECONFIG=/workspaces/k6/kubeconfig.yaml' >> ~/.bashrc
echo 'Done. Now run: export KUBECONFIG=/workspaces/k6/kubeconfig.yaml'
echo 'Or open a new terminal.'
