node_modules:
	npm install

test: node_modules
	node cli.js

run: node_modules
	PORT=3000 node main.js

build:
	docker build -t tmahesh/devenv-api:latest .

push: build
	docker push tmahesh/devenv-api:latest

deploy: push
	kubectl apply -f devenv-api.yml