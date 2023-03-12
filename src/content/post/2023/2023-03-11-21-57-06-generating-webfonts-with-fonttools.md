---
slug: "2023/03/11/generating-webfonts-with-fonttools"
title: "Generating webfonts with fontTools"
description: "How to generate webfonts with fontTools from ttf sources"
date: "2023-03-11 21:57:06"
update: "2023-03-11 21:57:06"
category: "note"
tags: ["webfonts", "fonttools"]
---

Previously, I wrote a note on ways to [convert ttf fonts to woff and woff2 formats](/post/2021/04/14/converting-ttf-files-to-woff-and-woff2/). Unfortunately, those methods gave me mixed results when it comes to [variable fonts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Fonts/Variable_Fonts_Guide). Many times, I found that [axes](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variation-settings#registered_and_custom_axes) were messed up after conversion.

In this post, I'll use a more robust approach for font conversion using [fontTools](https://github.com/fonttools/fonttools): a library for manipulating fonts.

## Preparing a working environment

Let's create a `Dockerfile` in a folder (say, `fonttoolslab`) to install required dependencies.

```dockerfile {4}
FROM python:alpine3.15

RUN apk add --no-cache --virtual .build-deps gcc g++
RUN pip install fonttools[woff]
RUN apk del .build-deps
```

To convert a bunch of `ttf` files, you can dump them into a folder (say, `.workspace`) and then invoke the following script.

```python caption="woff2.py"
import glob
import os
from fontTools.ttLib import TTFont

for filepath in glob.iglob('.workspace/*.ttf'):
	f = TTFont(filepath)
	f.flavor = 'woff2'
	print('INFO:fontTools.ttLib.woff2: Generating WOFF2 for ' + filepath)
	f.save(os.path.splitext(filepath)[0] + '.woff2')
```

This script loops over all the `ttf` files in the `.workspace` directory, and converts them into `woff2` files.

Open terminal in the directory where you created the `Dockerfile` and `woff2.py` (that's `fonttoolslab`) and run the following command to generate a Docker image.

```sh prompt{1}
docker build -t fonttoolslab .
```

This will generate a Docker image `fonttoolslab:latest`.

## Converting the files

Copy all your `ttf` files in the `.workspace` directory (create one if you haven't).

Launch a Docker container as follows.

```sh prompt{1}
docker run --rm -it -v ${pwd}:/fonts fonttoolslab sh
```

:::warn
You might have to use the full path of the current working directory (instead of `${pwd}`) depending on your operating system or shell.
:::

This will launch the container in interactive mode and you'll land on a shell prompt. Run the following commands to finish the conversion.

```sh
# cd /fonts
# python woff2.py
```

Open the `.workspace` folder on your machine. You'll find a `woff2` file corresponding to each `ttf` file. This method works for both static and variable fonts.

---

- Thanks to [Rosalie Wagner](https://github.com/RosaWagner) for [pointing out](https://github.com/JetBrains/JetBrainsMono/issues/519#issuecomment-1008895097) that I can use fontTools for such conversions.
- I used the same approach to [generate variable webfonts](https://github.com/JetBrains/JetBrainsMono/blob/68685b56df8b0a5ec9bc677ca0e162bf6dcc355b/scripts/generate_variable_webfonts.py#L1) for [JetBrainsMono](https://github.com/JetBrains/JetBrainsMono).
