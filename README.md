Blocks the execution until the defined container is healthy in a Docker Compose environment. Useful if you have to automatize a script after starting some containers (for example in some CI/CD systems like GitLab).

# Installation
Just install the `healthcheck-block` package (locally or globally) with `npm`, `yarn`, or any other Node dependency manager (for example `yarn global add healthcheck-block`).

# Usage
If installed locally with `npm`, run it with `node node_modules/healthcheck-block network container`, where `network` is the name of the network (project), and `container` is the name of the container (service). For example:

```bash
docker-compose up -d
node node_modules/healthcheck-block airbnb php
docker-compose -p airbnb exec php composer update
```

If installed locally with `yarn`, you can also run it with `yarn run healthcheck-block`. If installed globally (with either `npm` or `yarn`), the `healthcheck-block` console command should be globally available.

As default, we are checking healthiness by executing the healthcheck script (`./docker-healthcheck` as default), so that your script doesn't have to wait for the next cycle of [Docker healthcheck](https://docs.docker.com/engine/reference/builder/#healthcheck) (which is 30 seconds by default). Quite obviously this method does not work, if the healthcheck is defined in the Docker Compose YML file. You can change the script to run with the `-script` parameter, like:

```bash
healthcheck-block airbnb php -script healthcheck.sh
```

You can also wait for a container to be actually marked healthy by Docker with the `--wait-healthcheck` flag.

If you would like the script to terminate with an error code if the container is still not healthy after a time limit, you can set a timeout in seconds with `-timeout`, for example:

```bash
healthcheck-block airbnb php -timeout 30
```
