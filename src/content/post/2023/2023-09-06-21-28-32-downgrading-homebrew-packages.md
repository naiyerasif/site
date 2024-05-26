---
slug: "2023/09/06/downgrading-homebrew-packages"
title: "Downgrading homebrew packages"
date: 2023-09-06 21:28:32
update: 2023-09-06 21:28:32
type: "status"
category: "update"
---

Today, Node.js 20.6.0 [broke the build](https://github.com/nodejs/node/issues/49497) for this blog and I thought I'd just downgrade to the previously working version with the following command.

```sh prompt{1}
brew install node@20.5.1
```

Except that this doesn't work, unlike [scoop](https://scoop.sh/) on Windows.

Turns out you've to download an older version of the formula from GitHub and run `brew install` with it to downgrade to a specific version.

```sh prompt{2, 5}
# download the formula for node@20.5.1
curl -o node.rb https://raw.githubusercontent.com/Homebrew/homebrew-core/442f9cc511ce6dfe75b96b2c83749d90dde914d2/Formula/n/node.rb

# install with the downloaded formula
brew install node.rb
```

It is as terrible as it looks, but it gets the job done.
