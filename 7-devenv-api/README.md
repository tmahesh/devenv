## API to interact with the operator

## Test
```sh
node cli.js
```

## Run api on local
```sh
make run
```

### Using the api
```sh
curl -X GET localhost:3000/devenv
curl -X POST localhost:3000/devenv/mahesh
curl -X DELETE localhost:3000/devenv/mahesh

```

## Deploy api to k8s
```sh
make deploy
```

### Forward port to local for testing
```sh
kubectl port-forward pod/devenv-api<pod-name> 3000:3000
```