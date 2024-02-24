---
slug: "2023/08/06/on-how-i-use-firefox"
title: "On how I use Firefox"
description: "I've used Firefox for years, and I've picked up some habits to use it effectively. They'll help you too if you use Firefox or convince you to switch."
date: 2023-08-06 14:40:40
update: 2023-08-06 14:40:40
category: "opinion"
---

I've been using Firefox since ages. Here are some usage habits I've picked up along the way. May these come in handy in your need (if you're also a Firefox user), or persuade you to switch to Firefox (if you're not).

## Sandbox sessions with Container tabs

Firefox's [Multi-Account Containers](https://addons.mozilla.org/en-US/firefox/addon/multi-account-containers/) extension is a unique feature that keeps me sticking with Firefox. You may have to deal with separate Instagram accounts or open AWS consoles with different roles in the browser. This extension allows you to open multiple sessions on a site in the same browser window without resorting to different profiles. You can stay logged in to Google in the container tab where you watch YouTube videos, and keep your search history off the Google's hands in a different container tab.

## Address bar search modifiers

When you search something with address bar, you can narrow down the scope of your search with special characters (called search modifiers) by typing them followed by space followed by your search query. Here are some search modifiers baked in Firefox[^1].

- `^` shows matches in your browsing history
- `*` shows matches in your bookmarks
- `%` shows matches in your currently open tabs
- `#` shows matches where every search term is part of the title or part of a tag
- `+` shows matches in bookmarks that you've tagged
- `$` shows matches where every search term is part of the URL
- `?` shows only search suggestions, useful when Firefox treats your search as a URL instead of search query

You can roll own modifiers through keywords associated with a bookmark. For example, if you want a modifier `/yt<space>` to search with YouTube, you can bookmark `https://www.youtube.com/results?search_query=%s` and assign a keyword `/yt` to this bookmark. `%s` indicates where your search query gets inserted. Then `/yt coke studio` expands to `https://www.youtube.com/results?search_query=coke+studio`.

[^1]: Listed on [Address bar autocomplete suggestions in Firefox](https://support.mozilla.org/en-US/kb/address-bar-autocomplete-firefox#w_changing-results-on-the-fly)

## uBlock Origin support

It might sound silly to gush about extension support, but Firefox is the only browser that officially supports my favorite extension—[uBlock Origin](https://github.com/gorhill/uBlock)—on mobile[^2]. It's really hard to beat the ad-free experience compared to Chrome[^3].

And with Google working to [ruin extensions on Chrome](https://www.eff.org/deeplinks/2021/12/chrome-users-beware-manifest-v3-deceitful-and-threatening), Firefox might be the only browser where uBlock Origin will work [effectively](https://github.com/uBlockOrigin/uBlock-issues/issues/338).

[^2]: [Kiwi](https://kiwibrowser.com/) (on Android) and [Orion](https://browser.kagi.com/) (on iOS) also offer _experimental_ support for uBlock Origin.
[^3]: Safari on iOS does support adblock extensions, such as the excellent [Wipr](https://apps.apple.com/us/app/wipr/id1030595027) extension but they are limited by what Safari allows them to do. Suffice to say, the experience isn't up to par with Firefox using uBlock Origin on Android. If you're on iOS, you're still better off with Safari since Firefox on iOS doesn't support extensions.
