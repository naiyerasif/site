---
slug: "2023/03/07/nested-border-radii"
title: "Nested border radii"
date: "2023-03-07 21:14:58"
update: "2023-03-07 21:14:58"
category: "status"
---

:::embed{author="Lily Konings" src="https://twitter.com/lilykonings/status/1567317037126680576" published="2022-09-07 01:01:15"}

Tiny design detail: nested border radii look really funky if they're the same. To maintain the same curvature, the outer radius = inner radius + padding.

![Nested border radii](/images/post/2023/2023-03-07-21-14-58-nested-border-radii-01.png)

:::

- Andy Bell wrote about this technique using CSS properties: https://set.studio/relative-rounded-corners/
- Adam Argyle discussed an alternative approach using `overflow-clip-margin`: https://nerdy.dev/perfect-nested-radius-with-overflow-clip-margin
