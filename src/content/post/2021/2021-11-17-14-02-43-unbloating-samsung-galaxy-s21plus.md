---
slug: "2021/11/17/unbloating-samsung-galaxy-s21plus"
title: "Unbloating Samsung Galaxy S21+"
description: "Samsung phones traditionally come with a ton of preinstalled bloatware. Learn how to get rid of it using Android Debug Bridge."
date: 2021-11-17 14:02:43
update: 2022-06-13 16:00:31
type: "post"
category: "note"
---

> Install [Android Debug Bridge](https://developer.android.com/tools/adb) (ADB) to follow this guide.

Launch the ADB.

```sh
adb shell
```

Run the following commands to uninstall the bloatware.

```sh
# Facebook
pm uninstall -k --user 0 com.facebook.appmanager
pm uninstall -k --user 0 com.facebook.services
pm uninstall -k --user 0 com.facebook.system

# Samsung Free
pm uninstall -k --user 0 com.samsung.android.app.spage

# Samsung Calendar
pm uninstall -k --user 0 com.samsung.android.calendar
pm uninstall -k --user 0 com.samsung.android.app.reminder

# My Galaxy
pm uninstall -k --user 0 com.mygalaxy

# Smart Call / Hiya
pm uninstall -k --user 0 com.samsung.android.smartcallprovider

# Swiftkey
pm uninstall -k --user 0 com.swiftkey.swiftkeyconfigurator
pm uninstall -k --user 0 com.touchtype.swiftkey

# Microsoft
pm uninstall -k --user 0 com.microsoft.appmanager
pm uninstall -k --user 0 com.microsoft.skydrive
```

Aggressively uninstalling certain apps can cause bootloops in some Samsung devices. You can disable some apps if needed.

```sh
# Link Sharing
pm disable-user --user 0 com.samsung.android.app.simplesharing

# SmartView
pm disable-user --user 0 com.samsung.android.smartmirroring

# Quick Share
pm disable-user --user 0 com.samsung.android.app.sharelive
pm disable-user --user 0 com.samsung.android.aware.service

# Samsung Health
pm disable-user --user 0 com.samsung.android.service.health
```

I've tested that the phone works properly by removing the following apps.

```sh
pm uninstall -k --user 0 com.samsung.android.smartswitchassistant
pm uninstall -k --user 0 com.samsung.systemui.bixby2
pm uninstall -k --user 0 com.samsung.android.app.settings.bixby
pm uninstall -k --user 0 com.samsung.android.bixby.agent
pm uninstall -k --user 0 com.samsung.android.bixby.agent.dummy
pm uninstall -k --user 0 com.samsung.android.bixby.service
pm uninstall -k --user 0 com.samsung.android.bixby.wakeup
pm uninstall -k --user 0 com.samsung.android.bixbyvision.framework
pm uninstall -k --user 0 com.samsung.android.game.gamehome
pm uninstall -k --user 0 com.samsung.SMT
pm uninstall -k --user 0 com.samsung.android.privateshare
pm uninstall -k --user 0 com.samsung.android.beaconmanager
pm uninstall -k --user 0 com.samsung.android.service.stplatform
pm uninstall -k --user 0 com.samsung.android.arzone
pm uninstall -k --user 0 com.samsung.android.stickercenter
pm uninstall -k --user 0 com.samsung.android.mateagent
pm uninstall -k --user 0 com.samsung.android.rubin.app
pm uninstall -k --user 0 com.samsung.android.ardrawing
pm uninstall -k --user 0 com.samsung.android.aremoji
pm uninstall -k --user 0 com.samsung.android.aremojieditor
pm uninstall -k --user 0 com.samsung.android.video
pm uninstall -k --user 0 com.samsung.android.mobileservice
pm uninstall -k --user 0 com.samsung.android.app.tips
pm uninstall -k --user 0 com.samsung.android.app.routines
pm uninstall -k --user 0 com.samsung.android.visionintelligence
pm uninstall -k --user 0 com.samsung.android.samsungpass
pm uninstall -k --user 0 com.samsung.android.samsungpassautofill
pm uninstall -k --user 0 com.samsung.app.highlightplayer
pm uninstall -k --user 0 com.sec.android.app.billing
pm uninstall -k --user 0 com.sec.android.mimage.avatarstickers
pm uninstall -k --user 0 com.samsung.android.livestickers
pm uninstall -k --user 0 com.samsung.android.kidsinstaller
pm uninstall -k --user 0 com.samsung.storyservice
pm uninstall -k --user 0 com.sec.android.app.kidshome
pm uninstall -k --user 0 com.samsung.android.app.notes.addons
pm uninstall -k --user 0 com.hiya.star
pm uninstall -k --user 0 com.samsung.clipboardsaveservice
pm uninstall -k --user 0 com.samsung.android.app.galaxyfinder
pm uninstall -k --user 0 com.sec.android.widgetapp.webmanual
pm uninstall -k --user 0 com.sec.spp.push
pm uninstall -k --user 0 com.sec.android.app.samsungapps
pm uninstall -k --user 0 com.samsung.android.themestore
pm uninstall -k --user 0 com.samsung.android.ipsgeofence
pm uninstall -k --user 0 com.samsung.android.honeyboard
```

---

You can filter the installed apps by specific domain with the following command.

```sh
pm list packages com.facebook
pm list packages bixby
pm list packages com.swiftkey
```

If you've multiple users, you can list them with the following command.

```sh
pm list users
```

If you need a full list of packages, use the following command to dump them in a file.

```sh
adb shell pm list packages -f > packages.txt
```

You can also refer to the package details of OEM apps published by Samsung from [Knox](https://docs.samsungknox.com/CCMode/G996B_5G_R.pdf).
