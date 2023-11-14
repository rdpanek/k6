#!/bin/bash

kubectl get -n k6 events --watch --output=json | while read -r line
do
  if [[ $POD_NAME =~ "app-pod1" ]]
  then
    kubectl apply -f ../../k8s/k6-from-configmap.yaml
  fi
done