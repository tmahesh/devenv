assume a simple docker-compose setup of proxy server and a backend-api

lets say the proxy server listens on 80 and 443
using self-signed certs


## test
```sh
make up
curl localhost:8080
curl -k https://localhost
curl -k -H "Host: api.tmahesh.com" https://localhost
make down
```

or u can add `127.0.0.1 api.tmahesh.com` to `/etc/hosts` and run `curl -k https://api.tmahesh.com`
