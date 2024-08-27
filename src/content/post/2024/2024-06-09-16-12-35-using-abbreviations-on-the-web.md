---
slug: "2024/06/09/using-abbreviations-on-the-web"
title: "Using abbreviations on the web"
description: "The <abbr> element may sound enticing for abbreviations. However, it does not work well on touch devices and screen readers, requiring adjustments for optimal experience."
date: 2024-06-09 16:12:35
update: 2024-06-09 23:56:15
type: "reference"
---

While working on the web, you might reach out to the [`<abbr>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/abbr) (abbreviation) element to represent abbreviations, acronyms, and [numeronyms](https://en.wikipedia.org/wiki/Numeronym), as suggested by the [HTML Standard](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-abbr-element). The `<abbr>` element is well supported in the browsers, and on the surface, it appears to be a perfect fit. Realities on the ground are, unfortunately, not so good.

## The illusive expansion

The `<abbr>` element supports the `title` attribute where you can mention the expanded form of the abbreviation. When you hover on it, the title becomes visible in some browsers.

```html
<abbr title="Any Decision Record">ADR</abbr>
```

The experience is not so good on devices that do not support hover (for example, touchscreens). If I am on a phone, I cannot see the expansion because I cannot hover on the `<abbr>` element by tapping or pressing on it.

You can fix this behavior with the following CSS rule.

```css
@media (pointer: coarse), (any-hover: none) {
	:where(abbr[title])::after {
		content: " (" attr(title) ")";
	}
}
```

The `pointer: coarse` media query checks if you are using a device with an input mechanism of limited accuracy (such as fingers on a touchscreen). The `any-hover: none` media query checks if none of the input mechanisms on your device support hover (such as a Surface tablet not attached with a keyboard). In such cases, you would see the `title` appended after the `<abbr>` element.

:::commend{.quote showIndicator="false"}
If you have no other option but to use the `<abbr>` element, display the expansion of the abbreviation on devices that do not support the hover state.
:::

## The unannounced expansion

[VoiceOver](https://support.apple.com/en-in/guide/voiceover/welcome/mac) does not announce the title of an `<abbr>` element. Neither do [JAWS](https://www.freedomscientific.com/products/software/jaws/) and [NVDA](https://github.com/nvaccess/nvda), with their default settings. People using these screen readers will not hear the expansion at all. You can try to fix this by slapping an `aria-label` on the `<abbr>` element, but that [will not work](https://w3c.github.io/html-aria/#el-abbr) either.

In the end, you might as well spell out the expansion after the abbreviation. This is precisely what Web Accessibility Initiative (WAI) [suggests](https://www.w3.org/WAI/WCAG21/Understanding/abbreviations).

:::commend{.quote showIndicator="false"}
If the abbreviation has only one meaning within a document, mention the expansion on its first occurrence, or all occurrences, in the document.
:::

:::note{title="Abbreviation with only one meaning"}
During the GPS (Global Positioning System) workshop, participants learned how it works. The instructor explained that GPS relies on satellites to provide location data. The smartphones have built-in GPS, which is used for maps and other location-based services.
:::

You can also specify the expansions with a dedicated glossary in the document. This is especially useful when a lot of abbreviations or technical terms are used in a document.

:::commend{.quote showIndicator="false"}
If the abbreviation means different things within a document, mention the expansion on all occurrences to avoid ambiguity.
:::

:::note{title="Abbreviation with different meanings"}
We enabled CC (Closed Captioning) on the video about the famous CC (Court Case) to understand the testimony in the unfamiliar languages.
:::
