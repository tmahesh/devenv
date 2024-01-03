## Get acces to a k8s cluser
- via docker-desktop
- via king
- via minikube
- via GCP,AWS, Azure etc..


## setup
```sh
kubectl apply -f russian-doll.yml
```

## add caddy to expose pods dynamically via an LB
### There is some clever reverse proxy logic in there..
```sh
kubectl create configmap caddy-configmap --from-file Caddyfile -o yaml --dry-run=client | kubectl apply -f -
kubectl apply -f caddy.yml
kubectl port-forward services/doll-service --address=0.0.0.0 443 
#on mac, u can expose on 443 withoout sudo; if u do it 0.0.0.0 
```

## test

## debugging
```sh
kubectl exec doll -c russian-doll -it -- bash
```