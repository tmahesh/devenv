## setup a k8s operator

### we will use operator-sdk [framework](https://sdk.operatorframework.io/)
```sh
operator-sdk init --plugins helm --domain tmahesh.com --group dev --version v1 --kind DevEnvironment --helm-chart ../5-setup-helm/envchart
```

