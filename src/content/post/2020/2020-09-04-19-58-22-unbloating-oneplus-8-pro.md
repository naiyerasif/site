---
slug: "2020/09/04/unbloating-oneplus-8-pro"
title: "Unbloating OnePlus 8 Pro"
description: "Recently launched OnePlus 8 Pro comes with a lot of preinstalled bloatware. Learn how to get rid of it using Android Debug Bridge."
date: 2020-09-04 19:58:22
update: 2020-10-11 05:42:23
category: "note"
tags: ["unbloat", "os", "oneplus"]
---

> Install [Android Debug Bridge](https://developer.android.com/tools/adb) (ADB) to follow this guide.

Launch the ADB.

```sh
adb shell
```

Run the following commands to uninstall the bloatware.

```sh
pm uninstall -k --user 0 com.facebook.appmanager
pm uninstall -k --user 0 com.facebook.services
pm uninstall -k --user 0 com.facebook.system
pm uninstall -k --user 0 com.heytap.cloud
pm uninstall -k --user 0 com.heytap.openid
pm uninstall -k --user 0 com.heytap.mcs
pm uninstall -k --user 0 com.google.android.apps.youtube.music
pm uninstall -k --user 0 com.oneplus.twspods
pm uninstall -k --user 0 com.redteamobile.virtual.softsim
pm uninstall -k --user 0 com.redteamobile.oneplus.roaming
```

---

You can filter the installed apps by specific domain with the following command.

```sh
pm list packages com.facebook
pm list packages com.heytap
pm list packages com.oneplus
pm list packages com.redteamobile
```
