---
slug: "2020/09/07/forwarding-a-port-to-android-with-adb"
title: "Forwarding a port to Android with ADB"
date: 2020-09-07 16:11:22
update: 2020-09-07 16:11:22
type: "guide"
---

Say you are developing a web app which is accessible on the port `8080`. You want to open it on your Android device to verify if it works on an Android browser. You can do so by forwarding the port `8080` through [ADB](https://developer.android.com/tools/releases/platform-tools) (Android Debug Bridge).

Connect your Android device to your computer through USB and [turn on USB debugging](https://developer.android.com/studio/debug/dev-options#Enable-debugging). Open a terminal on your computer and type the following command.

```sh title="Forwad a port to Android with adb"
adb forward tcp:8080 tcp:8080
```

…and open the web app on any Android browser on your phone.
