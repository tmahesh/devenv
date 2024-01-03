FROM ubuntu:20.04
RUN apt-get update
ENV DEBIAN_FRONTEND=noninteractive
RUN apt install -y curl wget apt-transport-https ca-certificates software-properties-common build-essential \
    unzip gnupg lsb-release vim jq make
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add - && \
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"  && \
    apt-cache policy docker-ce && \
    apt install -y docker-ce docker-compose

#saves time: Keep var/lib/docker in /docker_data so that we can reuse images pulled across runs..
VOLUME docker_data
ENV DOCKER_OPTS="--data-root /docker_data"
WORKDIR /russian-doll
COPY 1-local-setup/ .
COPY 2-russian-doll/ .
#copy docker login credentials or mount them using a volume.
#COPY docker-config.json /root/.docker/config.json
ENTRYPOINT /russian-doll/entrypoint