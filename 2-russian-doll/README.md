## Russian-Doll is containers inside containers..

### But, why?
so that docker compose can be lift-and-shift as is.. 
you don't need to maintain a dev stack and dev-stack for k8s seperately.

## Test
```sh
make build run
make doll-exec #you are now inside the doll
make logs
#run typically curl checks
```

## Publish the image
```sh
make push # sends the image to registry
```

## Debugging
```sh
make dry-run
make doll-exec
./entrypoint (this will run inside the shell of russian-doll container)
#Run tests from previous step to check all-is-well
Ctrl-C to stop 
exit # exits the russian-doll container
```
