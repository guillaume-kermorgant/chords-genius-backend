# Chords Genius

Find chords... (TODO: find a better description)

**This project is a personal project and is not "production ready":**
- test coverage should be higher
- there should be an way to configure the ElasticSearch instance more easily (TLS, multi-node etc...) 
- there should be a way to easily deploy the whole app (helm chart, k8s operator, docker-compose...)

## Run locally (step by step)

1. Prerequisites

- node v12+ (tested with Node v12.18.3, should work with any version of Node 10+)
- docker (tested with Docker v18.09.0, should work with any recent version of Docker)
- docker-compose (tested with v 1.27.4)

2. Clone the project

```
git clone git@github.com:gkermo/chords-genius.git
cd chords-genius
```

3. Install dependencies

```shell
npm ci
```

4. [Optional] Run ElasticSearch (single node cluster, for development purpose only), and preload it with data

This step is only required to improve the API. We use ElasticSearch to index data that we know is accurate (c.f. ./resources/tracks.json).

The end goal is to build a great database of tracks and their musical details (key, bpm, chords sequences etc...).

```shell
./elasticsearch/run_elasticsearch
```

You can keep this terminal window open with the ElasticSearch logs (always a nice to have), and open another terminal window or tab and run:s

```
./elasticsearch/load_elasticsearch_data
```
s
5. Run the Node.js app:


```shell
npm start
```

6. Sanity check

```shell
curl -ks "http://localhost:6850/api/v1/chords?artist=fela+kuti&track=water+no+get+enemy" | jq .
```

## Configurations

There is a couple of environment variables you can change in `.env`, if needed.