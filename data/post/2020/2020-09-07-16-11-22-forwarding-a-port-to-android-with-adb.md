---
slug: "2020/09/07/forwarding-a-port-to-android-with-adb"
title: "Forwarding a port to Android with ADB"
date: 2020-09-07 16:11:22
update: 2025-12-22 21:53:22
type: "note"
---

Say you are developing a web app that runs locally on port `8080`, and you want to test it in an Android browser on your phone. You can do this by forwarding port `8080` from your computer to your phone using [ADB](https://developer.android.com/tools/releases/platform-tools) (Android Debug Bridge).

First, connect your Android device to your computer through USB and [switch on USB debugging](https://developer.android.com/studio/debug/dev-options#Enable-debugging). Then, open a terminal on your computer and run the following command

```sh title="Forwad a port to Android with adb"
adb forward tcp:8080 tcp:8080
```

…and open the web app on the Android browser on your phone.
