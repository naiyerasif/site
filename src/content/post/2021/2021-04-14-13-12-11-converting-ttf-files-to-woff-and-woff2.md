---
slug: "2021/04/14/converting-ttf-files-to-woff-and-woff2"
title: "Converting TTF files to WOFF and WOFF2"
description: "Typically, webfonts come in woff2 and woff formats. But sometimes, a font may be available only in TTF format. Explore how to locally convert the TTF files."
date: 2021-04-14 13:12:11
update: 2021-04-14 13:12:11
type: "post"
category: "note"
---

Recently, I came across a font that I wanted to use on a web application. By default, I usually rely on [woff2](https://caniuse.com/woff2) and [woff](https://caniuse.com/woff) formats to load webfonts. However, the said font was available only in TTF format. To convert the TTF files, I wanted tools that would work offline and wouldn't require uploading the original files.

## Converting TTF to WOFF

[Fontello](https://fontello.com/) provides an NPM package called [ttf2woff](https://github.com/fontello/ttf2woff). It works as a CLI (command-line interface). After installing it globally through NPM,

```sh
npm install -g ttf2woff
```

it exposes a `ttf2woff` command that can take the path of a TTF file as input and the path of a WOFF file as an output.

```sh
ttf2woff font-regular.ttf font-regular.woff
```

Once the above command finishes, it dumps the converted WOFF file at `font-regular.woff`.

## Converting TTF to WOFF2

Google provides a great font compression library called [woff2](https://github.com/google/woff2) which can take TTF files and compress them into a WOFF2 file. Unfortunately, that project doesn't ship a single binary that you download and run to get the desired files. Instead, it needs to be built from the source. Fortunately, someone already built the entire source and published a ready-to-use [image](https://hub.docker.com/r/scrlk/woff2) on the Docker Hub.

To begin with, I pulled the image on my machine.

```sh
docker pull scrlk/woff2
```

Once the image was available, it was simply a matter of run the following docker command to generate the WOFF2 file.

```sh
docker run -it -v C:/fonts:/srv -w /srv scrlk/woff2 sh -c "woff2_compress font-regular.ttf"
```

The above command

- launches a container in interactive mode (using `-it` flag)
- mounts a volume on my machine at the location `C:/fonts` which is mapped to the `/srv` folder on the container. The `/srv` folder is set as the working directory of the container (using `-w` flag).
- launches a shell command `woff2_compress font-regular.ttf` where `font-regular.ttf` file is present in `C:/fonts` directory.

The `woff2_compress` command compresses and dumps the WOFF2 file at the same location where the script was invoked (`/srv` in the case above). Since the `/srv` folder on the container is mounted at the `C:/fonts` folder on the host, the WOFF2 file ends up on my machine.
