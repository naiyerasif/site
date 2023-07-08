---
slug: "2020/10/22/cleaning-up-docker-resources"
title: "Cleaning up Docker resources"
description: "In the past, we used manual scripts to remove stale Docker containers, images, volumes, etc. With Docker Engine 1.25, the prune command offers a simpler way to cleanup unused resources."
date: 2020-10-22 23:59:08
update: 2020-10-22 23:59:08
category: "note"
tags: ["docker"]
---

In good old days, we used to write [scripts to cleanup](https://stackoverflow.com/questions/32723111/how-to-remove-old-and-unused-docker-images) stale Docker containers, images, volumes, etc. Docker Engine 1.25 provided a welcome change on this. Now, there's a relatively straightforward way to cleanup unused resources using the following command.

```sh
docker system prune
```

With [this single command](https://docs.docker.com/engine/reference/commandline/system_prune/), you can remove all stopped containers, unused networks, dangling images, and build cache.

Even more importantly, `prune` is also available for other resource commands.

```sh
docker container prune  # removes all stopped containers
docker image prune      # removes unused images
docker network prune    # removes all unused networks
docker volume prune     # removes all unused local volumes
docker builder prune    # removes build cache
```

There are also a couple of useful flags available:

- `--all`, `-a` removes all unused images and build cache (not merely dangling ones)
- `--filter` provides filtering capabilities by label or timestamp. (e.g., `--filter "label!=latest"`, `--filter "until=24h"`). You can pass multiple filters.
- `--force`, `-f` executes the command without any confirmation prompt

You can read more about these commands in [system](https://docs.docker.com/engine/reference/commandline/system_prune/), [container](https://docs.docker.com/engine/reference/commandline/container_prune/), [image](https://docs.docker.com/engine/reference/commandline/image_prune/), [network](https://docs.docker.com/engine/reference/commandline/network_prune/), [volume](https://docs.docker.com/engine/reference/commandline/volume_prune/) and [builder](https://docs.docker.com/engine/reference/commandline/builder_prune/) references.
