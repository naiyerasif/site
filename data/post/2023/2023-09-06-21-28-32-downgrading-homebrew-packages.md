---
slug: "2023/09/06/downgrading-homebrew-packages"
title: "Downgrading homebrew packages"
date: 2023-09-06 21:28:32
update: 2025-09-24T23:48:08
type: "guide"
---

Back in 2023, I [lamented](/archive/2023/09/06/downgrading-homebrew-packages--1/) on how clumsy it was to downgrade a Homebrew package. Fast forward to 2025, and the situation has not improved at all. Judge for yourself as I walk you through the hoops.

Say you want to downgrade to Node.js 22. You dutifully download the formula for this version from GitHub.

```nu prompt{1}
curl --silent https://raw.githubusercontent.com/Homebrew/homebrew-core/9793f247d4bb3f545580c9bcd5eef6add5d3ce7a/Formula/n/node.rb | save node.rb
```

Now, try to install this formula with `brew install node.rb`. If you're on Homebrew 4.6.4 or higher, chances are you'd be greeted with an error message like this.

```nu prompt{1} output{2..8}
brew install node.rb
Error: Homebrew requires formulae to be in a tap, rejecting:
  node.rb (/Users/naiyer/Downloads/node.rb)

To create a tap, run e.g.
  brew tap-new <user|org>/<repository>
To create a formula in a tap run e.g.
  brew create <url> --tap=<user|org>/<repository>
```

What happened? Well, you see, Homebrew 4.6.4 introduced a [breaking change](https://github.com/Homebrew/brew/pull/20414). And now, you can't run a formula from a local file. Instead, as the error message mentions, you need to first create a *tap*.

Run the following command on terminal to create a local tap. Make sure you follow `<user>/<tap>` naming convention.

```nu prompt{1} output{2..18}
brew tap-new naiyer/local
Warning: tap-new is a developer command, so Homebrew's
developer mode has been automatically turned on.
To turn developer mode off, run:
  brew developer off

Initialized empty Git repository in /opt/homebrew/Library/Taps/naiyer/homebrew-local/.git/
[main (root-commit) 6c14116] Create naiyer/local tap
 3 files changed, 107 insertions(+)
 create mode 100644 .github/workflows/publish.yml
 create mode 100644 .github/workflows/tests.yml
 create mode 100644 README.md
==> Created naiyer/local
/opt/homebrew/Library/Taps/naiyer/homebrew-local

When a pull request making changes to a formula (or formulae) becomes green
(all checks passed), then you can publish the built bottles.
To do so, label your PR as `pr-pull` and the workflow will be triggered.
```

Ignore the uninteresting warnings, and download the formula in your tap.

```nu prompt{1}
curl --silent https://raw.githubusercontent.com/Homebrew/homebrew-core/9793f247d4bb3f545580c9bcd5eef6add5d3ce7a/Formula/n/node.rb | $'(brew --repository)/Library/Taps/naiyer/homebrew-local/Formula/node.rb'
```

And then, install the formula to finish the downgrade. Don't forget to prefix your tap name before the formula, else Homebrew will install the latest version of the formula.

```nu prompt{1}
brew install naiyer/local/node
```

This approach works for casks as well. But first, you'll have to create a folder for casks.

```nu prompt{1}
mkdir $'(brew --repository)/Library/Taps/naiyer/homebrew-local/Casks'
```

Now, say if you want to downgrade to [iina](https://github.com/iina/iina) 1.3.5, download the matching cask file and run `brew install --cask naiyer/local/iina`.

```nu prompt{1,3}
curl --silent https://raw.githubusercontent.com/Homebrew/homebrew-cask/fddf66a613c28c204274f5c354db51487af9d014/Casks/i/iina.rb | $'(brew --repository)/Library/Taps/naiyer/homebrew-local/Casks/iina.rb'

brew install --cask naiyer/local/iina
```

And that's how you downgrade Homebrew packages in 2025.
