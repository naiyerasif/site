---
slug: "2023/11/25/customizing-default-screenshot-location-on-macos"
title: "Customizing default screenshot location on macOS"
date: 2023-11-25 20:42:07
update: 2025-07-06 16:02:32
type: "note"
---

If you don't want macOS cluttering the Desktop with screenshots (and screen recordings), you can change the default location where macOS saves them. Press <kbd><kbd>Shift</kbd>+<kbd>Command</kbd>+<kbd>5</kbd></kbd>, select __Options__, and choose __Other Location&hellip;__. Pick a preferred directory in Finder.

:::assert
Check the __Remember Last Selection__ option so that macOS picks up the selected location next time.
:::

:::figure
![A screenshot of context menu to select a custom location for screenshots on macOS](./images/2023-11-25-20-42-07-customizing-default-screenshot-location-on-macos-01.webp)

::caption[Selecting a custom location for screenshots on macOS]
:::

If this setting is not present in your version of macOS, you can configure the screenshot location by running the following command in the terminal.

```sh
defaults write com.apple.screencapture "location" -string "~/Pictures/Captures" && killall SystemUIServer
```

To reset this preference, run the following command.

```sh
defaults delete com.apple.screencapture "location" && killall SystemUIServer
```
