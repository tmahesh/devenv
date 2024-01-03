up:
	docker compose up -d $(s)

down:
	docker compose down $(s)

logs:
	docker compose logs -f $(s)

exec:
	docker compose exec -it $(s) sh

######commands below not for inside the russian-doll container ######

build:
	docker build -t tmahesh/russian-doll:latest -f ./Dockerfile ../

push: build
	docker push tmahesh/russian-doll:latest

volume:
	docker volume inspect -f '{{.Mountpoint}}' docker_data || docker volume create docker_data	

#by passing -it; we can just Ctl-C, better console	
run: build volume
	docker run --rm -it --privileged -p 443:443 -p 27017:27017 -v docker_data:/docker_data --name russian-doll  tmahesh/russian-doll

dry-run: build volume
	docker run --rm -it --privileged -p 443:443 -v docker_data:/docker_data --name russian-doll --entrypoint "" tmahesh/russian-doll  bash

doll-exec:
	docker exec -it russian-doll bash

#will delete since run is with --rm 
stop:
	docker stop russian-doll

rm:
	docker rm -f -v russian-doll

ps:
	docker compose ps

clean: rm
	docker volume rm docker_data
