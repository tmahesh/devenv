## use helm to templatize russian-doll.yml into new_env.yml
uses helm to templatize and speed up the boot using snapshots

## test

helm install v1 envchart --set envName=a1b2c3
curl -k https://api-a1b2c3.tmahesh.com
helm uninstall v1


you can also delete resources from the previous steps
kubectl delete -f ../3-kubernetes/russian-doll.yml
