# devenv
## Setup cloud native developer environments on Kubernetes

Provision a dedicated environment for every developer or CI pipline, cloud native style.
If you have a docker-compose based local environment; Use this project as reference. 

Go through the [README's](./1-local-setup/README.md) in each of the folders for different milestones in the journey

When you finish the *7-steps*; 

### A simple curl request will boot up a new environment
```sh
curl -X POST http://localhsot:3000/devenv
```

### GET and DELETE api's
```sh
curl -X GET http://localhsot:3000/devenv
curl -X DELETE http://localhsot:3000/devenv/a1b2c3
```

### Behind the scenes its a kubernetes operator
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

### you can use all the kubectl commands on this `DevEnvironment` object
```sh
kubectl get DevEnvironments
kubectl delete DevEnvironments/devenv-a1b2c3
kubectl describe DevEnvironments/devenv-a1b2c3
kubectl delete $(kubectl get DevEnvironments -o name)
```