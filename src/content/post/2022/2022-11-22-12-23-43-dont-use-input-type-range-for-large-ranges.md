---
slug: "2022/11/22/dont-use-input-type-range-for-large-ranges"
title: "Don’t use <input type=range> for large ranges"
date: 2022-11-22 12:23:43
update: 2022-11-22 12:23:43
type: "status"
---

`<input type=range>` is an absolutely horrible way to accept values on touch devices, especially when the range is large. Provide an element where users can directly type the value.
