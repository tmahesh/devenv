## setup a k8s operator

### we will use operator-sdk [framework](https://sdk.operatorframework.io/)
```sh
operator-sdk init --plugins helm --domain tmahesh.com --group dev --version v1 --kind DevEnvironment --helm-chart ../5-setup-helm/envchart
```

```sh
make docker-build docker-push
make run
```

## Testing
```sh
cat <<EOF | kubectl apply -f -
apiVersion: dev.tmahesh.com/v1
kind: DevEnvironment
metadata:
  name: devenv-a1b2c3
spec:
  envName: a1b2c3
EOF
```

## Deploy operator to k8s cluster
```sh
make deploy
```